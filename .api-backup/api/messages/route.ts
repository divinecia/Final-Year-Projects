import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

// Schema for creating a message
const CreateMessageSchema = z.object({
  senderId: z.string().min(1, "Sender ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  content: z.string().min(1, "Message content is required"),
  type: z.enum(['text', 'image', 'file']).default('text'),
  jobId: z.string().optional(),
});

// Schema for message query parameters
const MessageQuerySchema = z.object({
  conversationId: z.string().optional(),
  senderId: z.string().optional(),
  receiverId: z.string().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).default('50'),
  before: z.string().optional(), // For pagination
});

// Function to generate conversation ID from two user IDs
function generateConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = MessageQuerySchema.parse(params);
    
    let conversationId = validatedParams.conversationId;
    
    // Generate conversation ID if not provided but sender and receiver are
    if (!conversationId && validatedParams.senderId && validatedParams.receiverId) {
      conversationId = generateConversationId(validatedParams.senderId, validatedParams.receiverId);
    }
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Conversation ID or both sender and receiver IDs are required'
      }, { status: 400 });
    }
    
    // Build query
    const queryConstraints: import('firebase/firestore').QueryConstraint[] = [
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc'),
      limit(validatedParams.limit)
    ];
    
    const q = query(collection(db, 'messages'), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }).reverse(); // Reverse to show oldest first
    
    return NextResponse.json({
      success: true,
      data: messages,
      conversationId: conversationId,
      total: messages.length,
      message: 'Messages retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CreateMessageSchema.parse(body);
    
    // Generate conversation ID
    const conversationId = generateConversationId(validatedData.senderId, validatedData.receiverId);
    
    // Create message document
    const messageData = {
      ...validatedData,
      conversationId,
      read: false,
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update or create conversation document
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      participants: [validatedData.senderId, validatedData.receiverId],
      lastMessage: validatedData.content,
      lastMessageAt: Timestamp.now(),
      lastSenderId: validatedData.senderId,
      updatedAt: Timestamp.now(),
    }).catch(async () => {
      // If conversation doesn't exist, create it
      await addDoc(collection(db, 'conversations'), {
        id: conversationId,
        participants: [validatedData.senderId, validatedData.receiverId],
        lastMessage: validatedData.content,
        lastMessageAt: Timestamp.now(),
        lastSenderId: validatedData.senderId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
    
    // Create notification for receiver
    await addDoc(collection(db, 'notifications'), {
      userId: validatedData.receiverId,
      title: 'New Message',
      description: `You have a new message: ${validatedData.content.substring(0, 50)}${validatedData.content.length > 50 ? '...' : ''}`,
      type: 'info',
      read: false,
      createdAt: Timestamp.now(),
      actionUrl: `/messages/${conversationId}`,
      metadata: {
        conversationId,
        senderId: validatedData.senderId,
        messageId: docRef.id,
      }
    });
    
    return NextResponse.json({
      success: true,
      data: { 
        id: docRef.id, 
        ...messageData,
        createdAt: messageData.createdAt.toDate().toISOString(),
      },
      message: 'Message sent successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error sending message:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid message data',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}
