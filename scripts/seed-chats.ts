#!/usr/bin/env tsx

/**
 * Create chat conversations and messages between households and workers
 */

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-4126e55eb7.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

const adminDb = admin.firestore();

const messageTypes = ['text', 'image', 'location', 'voice_note', 'document'];
const conversationStatuses = ['active', 'completed', 'archived'];

const sampleMessages = [
  // Initial contact
  "Hello! I saw your profile and I'm interested in your cleaning services. Are you available this week?",
  "Hi! Yes, I'm available. What kind of cleaning service do you need?",
  "I need a full house cleaning. It's a 3-bedroom house in Kimisagara. How much would you charge?",
  "For a 3-bedroom house, I charge 25,000 RWF. It usually takes about 4 hours. When would you like me to come?",
  
  // Scheduling
  "That sounds good. Would Thursday morning work for you?",
  "Thursday morning is perfect! What time should I arrive?",
  "Can you come at 9 AM?",
  "Yes, 9 AM on Thursday works for me. Please share your exact location.",
  
  // Service coordination
  "Great! I'll send you the location. Do you bring your own cleaning supplies?",
  "Yes, I bring all my own cleaning materials. Is there anything specific you want me to focus on?",
  "Please pay extra attention to the kitchen and bathrooms. Also, the living room carpet needs deep cleaning.",
  "Understood. Kitchen, bathrooms, and carpet deep cleaning. I'll make sure everything is spotless!",
  
  // Day of service
  "Good morning! I'm on my way. Should be there in 15 minutes.",
  "Perfect timing! I'll be here. The gate code is 1234.",
  "Thank you! Just arrived. Starting with the kitchen as discussed.",
  "Great! Let me know if you need anything. I'll be in the study working.",
  
  // Service updates
  "Kitchen is done! Moving to the bathrooms now.",
  "The bathrooms look amazing! Working on the living room carpet now.",
  "Almost finished! Just doing final touches in the bedrooms.",
  
  // Completion
  "All done! The house is clean and tidy. Please check everything.",
  "Wow! Everything looks perfect. Thank you so much! How should I pay you?",
  "Thank you! Mobile money works best for me. My number is on my profile.",
  "Payment sent! You did an excellent job. I'll definitely book you again.",
  "Thank you so much! I really appreciate it. Looking forward to working with you again!",
  
  // Follow-up
  "Hi! I need cleaning services again. Are you available next week?",
  "Hello! Yes, I remember you. What day next week works for you?",
  "How about Tuesday afternoon?",
  "Tuesday afternoon is good! Same house, same service?",
  "Yes, exactly the same. You were so thorough last time!"
];

async function createChats() {
  console.log('💬 Creating chat conversations and messages...\n');

  try {
    // Get households and workers
    const householdsSnapshot = await adminDb.collection('households').get();
    const workersSnapshot = await adminDb.collection('workers').get();

    if (householdsSnapshot.empty || workersSnapshot.empty) {
      console.log('❌ No households or workers found. Please seed them first.');
      return;
    }

    const households = householdsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      [key: string]: unknown;
    }>;

    const workers = workersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      [key: string]: unknown;
    }>;

    // Create 12-15 conversations
    const totalConversations = 14;
    
    for (let i = 0; i < totalConversations; i++) {
      const household = households[Math.floor(Math.random() * households.length)];
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const status = conversationStatuses[Math.floor(Math.random() * conversationStatuses.length)];
      
      const conversationId = `chat_${Date.now()}_${i}`;
      const startDate = new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000); // Last 45 days
      
      // Create conversation
      const conversationData = {
        id: conversationId,
        participants: [
          {
            id: household.id,
            name: `${household.firstName} ${household.lastName}`,
            type: 'household',
            lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
          },
          {
            id: worker.id,
            name: `${worker.firstName} ${worker.lastName}`,
            type: 'worker',
            lastSeen: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000)
          }
        ],
        status,
        createdAt: startDate,
        lastMessageAt: new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        messageCount: 0, // Will be updated as we add messages
        unreadCount: {
          [household.id]: Math.floor(Math.random() * 3),
          [worker.id]: Math.floor(Math.random() * 3)
        },
        isArchived: status === 'archived',
        jobRelated: true,
        serviceType: 'cleaning', // Default service type
        priority: Math.random() > 0.8 ? 'high' : 'normal',
        tags: ['service_inquiry', 'booking']
      };

      await adminDb.collection('conversations').doc(conversationId).set(conversationData);
      
      // Create 8-25 messages per conversation
      const messageCount = Math.floor(Math.random() * 18) + 8;
      let currentTime = startDate;
      let lastSender = '';
      
      for (let j = 0; j < messageCount; j++) {
        // Alternate between household and worker
        const isHouseholdSending = Math.random() > 0.5;
        const sender = isHouseholdSending ? household : worker;
        const senderType = isHouseholdSending ? 'household' : 'worker';
        
        // Don't let the same person send too many consecutive messages
        if (lastSender === sender.id && Math.random() > 0.3) {
          continue;
        }
        
        const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
        let messageContent = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        
        // Adjust message based on type
        if (messageType === 'image') {
          messageContent = 'shared an image';
        } else if (messageType === 'location') {
          messageContent = 'shared location';
        } else if (messageType === 'voice_note') {
          messageContent = 'sent a voice message';
        } else if (messageType === 'document') {
          messageContent = 'shared a document';
        }
        
        // Add time progression (messages spread over time)
        currentTime = new Date(currentTime.getTime() + Math.random() * 4 * 60 * 60 * 1000); // 0-4 hours later
        
        const messageData = {
          id: `msg_${Date.now()}_${j}`,
          conversationId,
          senderId: sender.id,
          senderName: `${sender.firstName} ${sender.lastName}`,
          senderType,
          messageType,
          content: messageContent,
          timestamp: currentTime,
          createdAt: currentTime,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: Math.random() > 0.2, // 80% of messages are read
          readAt: Math.random() > 0.2 ? new Date(currentTime.getTime() + Math.random() * 2 * 60 * 60 * 1000) : null,
          isDelivered: true,
          deliveredAt: new Date(currentTime.getTime() + Math.random() * 5 * 60 * 1000), // 0-5 minutes later
          isDeleted: false,
          replyTo: j > 2 && Math.random() > 0.8 ? `msg_${Date.now()}_${j-2}` : null,
          hasAttachment: messageType !== 'text',
          attachmentUrl: messageType === 'image' ? `https://images.househelp.rw/${Date.now()}.jpg` : 
                        messageType === 'document' ? `https://docs.househelp.rw/${Date.now()}.pdf` : null,
          attachmentSize: messageType !== 'text' ? Math.floor(Math.random() * 2000000) + 50000 : null, // 50KB - 2MB
          reactions: Math.random() > 0.7 ? ['👍', '❤️'][Math.floor(Math.random() * 2)] : null,
          isSystemMessage: false,
          metadata: {
            platform: 'mobile_app',
            version: '1.2.0',
            encrypted: true
          }
        };
        
        await adminDb.collection('conversations').doc(conversationId).collection('messages').add(messageData);
        lastSender = sender.id;
      }
      
      // Update conversation with message count
      await adminDb.collection('conversations').doc(conversationId).update({
        messageCount,
        lastMessageAt: currentTime
      });
      
      console.log(`✅ Conversation created: ${household.firstName} ↔ ${worker.firstName} (${messageCount} messages, ${status})`);
    }

    console.log('\n📊 Chat Statistics:');
    const conversationsSnapshot = await adminDb.collection('conversations').get();
    const allConversations = conversationsSnapshot.docs.map(doc => doc.data());

    console.log(`Total conversations: ${allConversations.length}`);
    
    const totalMessages = allConversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);
    console.log(`Total messages: ${totalMessages}`);
    
    console.log('\nBy Status:');
    conversationStatuses.forEach(status => {
      const count = allConversations.filter(c => c.status === status).length;
      console.log(`  ${status}: ${count} conversations`);
    });
    
    const avgMessages = totalMessages / allConversations.length;
    console.log(`\nAverage messages per conversation: ${Math.round(avgMessages)}`);
    
    const activeConversations = allConversations.filter(c => c.status === 'active').length;
    console.log(`Active conversations: ${activeConversations}`);

  } catch (error) {
    console.error('❌ Error creating chats:', error);
  }
}

createChats();
