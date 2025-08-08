import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { z } from 'zod';

// Schema for conversation query parameters
const ConversationQuerySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = ConversationQuerySchema.parse(params);
    
    // Get conversations where user is a participant
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', validatedParams.userId),
      orderBy('lastMessagedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const conversations = await Promise.all(
      querySnapshot.docs.map(async docSnapshot => {
        const data = docSnapshot.data();
        
        // Get the other participant's info
        const otherParticipantId = data.participants.find((p: string) => p !== validatedParams.userId);
        let otherParticipant = null;
        
        if (otherParticipantId) {
          // Try to get user info from worker collection first, then household
          const workerDoc = await getDoc(firestoreDoc(db, 'worker', otherParticipantId));
          if (workerDoc.exists()) {
            const workerData = workerDoc.data() as Record<string, unknown>;
            otherParticipant = {
              id: otherParticipantId,
              name: workerData.fullName || 'Worker',
              type: 'worker',
              profilePicture: workerData.profilePictureUrl || null,
            };
          } else {
            const householdDoc = await getDoc(firestoreDoc(db, 'household', otherParticipantId));
            if (householdDoc.exists()) {
              const householdData = householdDoc.data() as Record<string, unknown>;
              otherParticipant = {
                id: otherParticipantId,
                name: householdData.fullName || 'Household',
                type: 'household',
                profilePicture: householdData.profilePictureUrl || null,
              };
            }
          }
        }
        
        return {
          id: docSnapshot.id,
          conversationId: data.id || docSnapshot.id,
          otherParticipant,
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessagedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastSenderId: data.lastSenderId || '',
          unreadCount: 0, // TODO: Calculate actual unread count
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: conversations.filter(c => c.otherParticipant), // Filter out conversations with missing participants
      total: conversations.length,
      message: 'Conversations retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching conversations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}
