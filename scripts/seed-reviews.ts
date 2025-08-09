#!/usr/bin/env tsx

/**
 * Create realistic reviews and ratings between households and workers
 */

import * as admin from 'firebase-admin';
import serviceAccount from '../config/househelp-42493-firebase-adminsdk-fbsvc-ad129f5ed0.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'househelp-42493'
  });
}

const adminDb = admin.firestore();

// Sample review templates
const positiveReviews = [
  "Excellent service! Very punctual and professional. Highly recommend.",
  "Outstanding work quality. My house has never been cleaner. Will definitely book again.",
  "Very reliable and trustworthy. Great with children and cooking is amazing.",
  "Professional attitude and attention to detail. Worth every franc!",
  "Exceeded expectations. Very respectful and hardworking.",
  "Fantastic service! Always on time and does thorough work.",
  "Very satisfied with the quality. Will be my regular helper.",
  "Great communication and follows instructions perfectly.",
  "Honest and reliable. I feel comfortable leaving them in my home.",
  "Excellent cooking skills and very clean. Highly recommended!"
];

const neutralReviews = [
  "Good service overall. Could improve punctuality slightly.",
  "Decent work but sometimes needs reminders for specific tasks.",
  "Satisfactory service. Gets the job done as requested.",
  "Generally good but could be more proactive with tasks.",
  "Acceptable work quality. Room for improvement in some areas."
];

const improvements = [
  "communication",
  "punctuality", 
  "attention_to_detail",
  "task_completion",
  "initiative"
];

async function createReviews() {
  console.log('⭐ Creating reviews and ratings...\n');

  try {
    // Get all households and workers
    const householdsSnapshot = await adminDb.collection('households').get();
    const workersSnapshot = await adminDb.collection('workers').get();

    if (householdsSnapshot.empty || workersSnapshot.empty) {
      console.log('❌ No households or workers found. Please seed them first.');
      return;
    }

    const households = householdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      [key: string]: unknown;
    }>;
    const workers = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      services?: string[];
      [key: string]: unknown;
    }>;

    console.log(`Found ${households.length} households and ${workers.length} workers`);

    // Create 25-30 reviews
    const totalReviews = 28;
    
    for (let i = 0; i < totalReviews; i++) {
      const household = households[Math.floor(Math.random() * households.length)];
      const worker = workers[Math.floor(Math.random() * workers.length)];
      
      // Determine review type (80% positive, 15% neutral, 5% negative)
      const reviewRandom = Math.random();
      let rating, reviewText, reviewType;
      
      if (reviewRandom < 0.8) {
        // Positive review
        rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        reviewText = positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
        reviewType = 'positive';
      } else if (reviewRandom < 0.95) {
        // Neutral review
        rating = 3; // 3 stars
        reviewText = neutralReviews[Math.floor(Math.random() * neutralReviews.length)];
        reviewType = 'neutral';
      } else {
        // Negative review
        rating = Math.floor(Math.random() * 2) + 1; // 1-2 stars
        reviewText = "Service needs improvement. Not satisfied with the quality.";
        reviewType = 'negative';
      }

      const reviewData: {
        id: string;
        householdId: string;
        workerId: string;
        householdName: string;
        workerName: string;
        rating: number;
        reviewText: string;
        reviewType: string;
        serviceType: string;
        helpfulVotes: number;
        reportedCount: number;
        createdAt: Date;
        updatedAt: admin.firestore.FieldValue;
        isVisible: boolean;
        isVerified: boolean;
        improvementSuggestions?: string[];
      } = {
        id: `review_${Date.now()}_${i}`,
        householdId: household.id,
        workerId: worker.id,
        householdName: `${household.firstName} ${household.lastName}`,
        workerName: `${worker.firstName} ${worker.lastName}`,
        rating,
        reviewText,
        reviewType,
        serviceType: worker.services?.[Math.floor(Math.random() * worker.services?.length)] || 'cleaning',
        helpfulVotes: Math.floor(Math.random() * 8),
        reportedCount: reviewType === 'negative' ? Math.floor(Math.random() * 2) : 0,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isVisible: true,
        isVerified: true,
        improvementSuggestions: reviewType !== 'positive' ? [
          improvements[Math.floor(Math.random() * improvements.length)],
          improvements[Math.floor(Math.random() * improvements.length)]
        ] : undefined
      };

      // Filter out undefined values
      if (reviewData.improvementSuggestions === undefined) {
        delete (reviewData as any).improvementSuggestions;
      }

      await adminDb.collection('reviews').add(reviewData);
      console.log(`✅ Review created: ${household.firstName} → ${worker.firstName} (${rating}⭐)`);
    }

    console.log('\n📊 Review statistics:');
    const reviewsSnapshot = await adminDb.collection('reviews').get();
    const allReviews = reviewsSnapshot.docs.map(doc => doc.data());
    
    const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
    const ratingCounts = [1,2,3,4,5].map(star => 
      allReviews.filter(review => review.rating === star).length
    );

    console.log(`Total reviews: ${allReviews.length}`);
    console.log(`Average rating: ${avgRating.toFixed(1)}⭐`);
    console.log('Rating distribution:');
    ratingCounts.forEach((count, index) => {
      console.log(`  ${index + 1}⭐: ${count} reviews`);
    });

  } catch (error) {
    console.error('❌ Error creating reviews:', error);
  }
}

createReviews();
