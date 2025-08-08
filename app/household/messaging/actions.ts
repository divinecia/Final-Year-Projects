'use server';

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  orderBy, 
  serverTimestamp, 
  Timestamp, 
  where,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type Message = {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderType: 'household' | 'worker' | 'admin';
    jobId?: string;
    isRead: boolean;
    timestamp: Timestamp;
    attachments?: {
        name: string;
        type: string[];
        url: string;
    };
};

export type Conversation = {
    id: string;
    participants: string[];
    jobId?: string;
    jobTitle?: string;
    lastMessage?: string;
    lastMessagedAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type NewMessage = {
    text: string;
    senderId: string;
    senderName: string;
    senderType: 'household' | 'worker' | 'admin';
    jobId?: string;
};

export async function getConversations(userId: string): Promise<Conversation[]> {
    try {
        const conversationsCol = collection(db, 'chats');
        const q = query(
            conversationsCol, 
            where('participants', 'array-contains', userId),
            orderBy('lastMessagedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));

    } catch (error) {
        console.error("Error fetching conversations: ", error);
        return [];
    }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    try {
        const messagesCol = collection(db, 'chats', conversationId, 'messages');
        const q = query(
            messagesCol, 
            orderBy('timestamp', 'asc')
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

    } catch (error) {
        console.error("Error fetching messages: ", error);
        return [];
    }
}

export async function createConversation(
    participantIds: string[], 
    participantTypes: string[],
    jobId?: string,
    jobTitle?: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
    try {
        // Check if conversation already exists between these participants
        const conversationsCol = collection(db, 'chats');
        const existingConversationQuery = query(
            conversationsCol, 
            where('participants', '==', participantIds.sort())
        );
        const existingConversations = await getDocs(existingConversationQuery);
        
        if (!existingConversations.empty) {
            return { success: true, conversationId: existingConversations.docs[0].id };
        }

        // Initialize unread count object
        const unreadCount: { [userId: string]: number } = {};
        participantIds.forEach(id => {
            unreadCount[id] = 0;
        });

        // Create new conversation
        const docRef = await addDoc(conversationsCol, {
            participants: participantIds.sort(),
            participantTypes,
            jobId,
            jobTitle,
            lastMessage: '',
            lastMessagedAt: serverTimestamp(),
            lastMessageSender: '',
            unreadCount,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { success: true, conversationId: docRef.id };

    } catch (error) {
        console.error("Error creating conversation: ", error);
        return { success: false, error: "Failed to create conversation." };
    }
}

export async function sendMessage(
    conversationId: string, 
    message: NewMessage
): Promise<{ success: boolean; error?: string }> {
    if (!message.senderId) {
        return { success: false, error: "User not authenticated." };
    }
    if (!message.text.trim()) {
        return { success: false, error: "Message cannot be empty." };
    }

    try {
        // Add message to chats messages subcollection
        const messagesCol = collection(db, 'chats', conversationId, 'messages');
        await addDoc(messagesCol, {
            text: message.text,
            senderId: message.senderId,
            senderName: message.senderName,
            senderType: message.senderType,
            jobId: message.jobId,
            isRead: false,
            timestamp: serverTimestamp(),
        });

        // Update chat's last message info
        const chatRef = doc(db, 'chats', conversationId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
            await updateDoc(chatRef, {
                lastMessage: message.text.substring(0, 100),
                lastMessagedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        revalidatePath(`/household/messaging`);
        revalidatePath(`/worker/messaging`);

        return { success: true };

    } catch (error) {
        console.error("Error sending message: ", error);
        return { success: false, error: "Failed to send message. Please try again." };
    }
}

export async function markMessagesAsRead(
    conversationId: string, 
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Mark messages as read in the chats messages subcollection
        const messagesCol = collection(db, 'chats', conversationId, 'messages');
        const q = query(
            messagesCol, 
            where('senderId', '!=', userId),
            where('isRead', '==', false)
        );
        const querySnapshot = await getDocs(q);
        
        const messageUpdates = querySnapshot.docs.map((document) => 
            updateDoc(document.ref, { 
                isRead: true
            })
        );
        
        await Promise.all(messageUpdates);

        return { success: true };

    } catch (error) {
        console.error("Error marking messages as read: ", error);
        return { success: false, error: "Failed to mark messages as read." };
    }
}

export async function getUserProfile(userId: string, userType: 'household' | 'worker') {
    try {
        const collectionName = userType === 'household' ? 'household' : 'worker';
        const userRef = doc(db, collectionName, userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                id: userId,
                name: data.fullName || data.name || 'Unknown',
                profilePicture: data.profilePictureUrl || null,
                phone: data.phone || null,
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error fetching user profile: ", error);
        return null;
    }
}
