#!/usr/bin/env tsx

/**
 * Create worker training records and certifications
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

const trainingTypes = [
  'basic_housekeeping',
  'advanced_cleaning',
  'childcare_fundamentals',
  'elderly_care',
  'cooking_skills',
  'first_aid',
  'customer_service',
  'safety_protocols',
  'professional_communication',
  'time_management',
  'conflict_resolution',
  'digital_literacy',
  'financial_literacy',
  'health_and_hygiene',
  'emergency_response'
];

const trainingProviders = [
  'HouseHelp Training Institute',
  'Rwanda Skills Development Authority',
  'Professional Care Training Center',
  'Kigali Vocational Institute',
  'Community Development Center',
  'Women Empowerment Initiative',
  'Red Cross Rwanda',
  'Ministry of Health Training',
  'Customer Service Excellence Center'
];

const trainingStatuses = ['enrolled', 'in_progress', 'completed', 'certified', 'expired', 'failed'];

async function createTrainingRecords() {
  console.log('🎓 Creating worker training records...\n');

  try {
    // Get all workers
    const workersSnapshot = await adminDb.collection('workers').get();

    if (workersSnapshot.empty) {
      console.log('❌ No workers found. Please seed workers first.');
      return;
    }

    const workers = workersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      services?: string[];
      [key: string]: unknown;
    }>;

    console.log(`Found ${workers.length} workers. Creating training records...`);

    // Create 3-8 training records per worker
    for (const worker of workers) {
      const trainingCount = Math.floor(Math.random() * 6) + 3; // 3-8 trainings per worker
      
      for (let i = 0; i < trainingCount; i++) {
        const trainingType = trainingTypes[Math.floor(Math.random() * trainingTypes.length)];
        const provider = trainingProviders[Math.floor(Math.random() * trainingProviders.length)];
        const status = trainingStatuses[Math.floor(Math.random() * trainingStatuses.length)];
        
        // Generate realistic dates
        const enrollmentDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Last year
        const startDate = new Date(enrollmentDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Within 30 days
        
        // Training duration based on type
        let durationDays = 5; // Default 5 days
        switch (trainingType) {
          case 'first_aid':
          case 'emergency_response':
            durationDays = 2;
            break;
          case 'basic_housekeeping':
          case 'customer_service':
            durationDays = 3;
            break;
          case 'advanced_cleaning':
          case 'childcare_fundamentals':
          case 'elderly_care':
            durationDays = 7;
            break;
          case 'cooking_skills':
            durationDays = 10;
            break;
          case 'professional_communication':
          case 'digital_literacy':
          case 'financial_literacy':
            durationDays = 5;
            break;
        }
        
        const endDate = status !== 'enrolled' ? 
          new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000) : null;
        
        // Generate scores based on status
        let score = null;
        let grade = null;
        if (['completed', 'certified'].includes(status)) {
          score = Math.floor(Math.random() * 30) + 70; // 70-100%
          if (score >= 90) grade = 'A';
          else if (score >= 80) grade = 'B';
          else if (score >= 70) grade = 'C';
        } else if (status === 'failed') {
          score = Math.floor(Math.random() * 30) + 40; // 40-70%
          grade = 'F';
        }

        // Certificate details for completed/certified trainings
        const certificateId = ['completed', 'certified'].includes(status) ? 
          `CERT-${trainingType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}` : null;
        
        const validUntil = status === 'certified' ? 
          new Date(endDate!.getTime() + 365 * 24 * 60 * 60 * 1000) : // 1 year validity
          status === 'expired' ? 
          new Date(endDate!.getTime() + 365 * 24 * 60 * 60 * 1000 - Math.random() * 100 * 24 * 60 * 60 * 1000) : // Expired within last 100 days
          null;

        const trainingData = {
          id: `training_${Date.now()}_${i}`,
          workerId: worker.id,
          workerName: `${worker.firstName} ${worker.lastName}`,
          workerEmail: worker.email,
          
          // Training details
          trainingType,
          title: trainingType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          provider,
          category: (() => {
            if (['basic_housekeeping', 'advanced_cleaning'].includes(trainingType)) return 'cleaning';
            if (['childcare_fundamentals', 'elderly_care'].includes(trainingType)) return 'care';
            if (['cooking_skills'].includes(trainingType)) return 'culinary';
            if (['customer_service', 'professional_communication'].includes(trainingType)) return 'soft_skills';
            if (['first_aid', 'emergency_response', 'safety_protocols'].includes(trainingType)) return 'safety';
            return 'general';
          })(),
          
          // Status and dates
          status,
          enrollmentDate,
          startDate,
          endDate,
          completedDate: ['completed', 'certified'].includes(status) ? endDate : null,
          
          // Training format
          format: Math.random() > 0.3 ? 'in_person' : 'online',
          location: Math.random() > 0.3 ? 'Kigali Training Center' : 'Online Platform',
          language: Math.random() > 0.5 ? 'Kinyarwanda' : 'English',
          
          // Duration and schedule
          durationDays,
          totalHours: durationDays * 6, // 6 hours per day
          schedule: 'Monday to Friday, 8:00 AM - 2:00 PM',
          
          // Assessment
          hasAssessment: true,
          assessmentType: Math.random() > 0.5 ? 'practical' : 'written',
          score,
          maxScore: 100,
          grade,
          passingScore: 70,
          
          // Certification
          isCertified: status === 'certified',
          certificateId,
          certificateUrl: certificateId ? `https://certificates.househelp.rw/${certificateId}.pdf` : null,
          validUntil,
          isExpired: status === 'expired',
          
          // Training content
          modules: (() => {
            const allModules: { [key: string]: string[] } = {
              'basic_housekeeping': ['Room Cleaning', 'Kitchen Maintenance', 'Bathroom Sanitization', 'Organizing Skills'],
              'childcare_fundamentals': ['Child Development', 'Safety Protocols', 'Nutrition Basics', 'Activity Planning'],
              'elderly_care': ['Health Monitoring', 'Mobility Assistance', 'Medication Management', 'Companionship'],
              'first_aid': ['Basic Life Support', 'Wound Care', 'Emergency Response', 'CPR Certification'],
              'cooking_skills': ['Rwandan Cuisine', 'International Dishes', 'Nutrition Planning', 'Food Safety']
            };
            return allModules[trainingType] || ['Module 1', 'Module 2', 'Module 3'];
          })(),
          
          // Instructor
          instructor: (() => {
            const instructors = [
              'Dr. Marie Uwimana',
              'Mr. Jean Baptiste Nzeyimana',
              'Ms. Grace Mukamana',
              'Prof. Samuel Habimana',
              'Mrs. Agnes Murekatete'
            ];
            return instructors[Math.floor(Math.random() * instructors.length)];
          })(),
          
          // Feedback and ratings
          trainerRating: ['completed', 'certified'].includes(status) ? 
            Math.floor(Math.random() * 2) + 4 : null, // 4-5 stars
          trainingRating: ['completed', 'certified'].includes(status) ? 
            Math.floor(Math.random() * 2) + 4 : null,
          feedback: ['completed', 'certified'].includes(status) ? 
            'Excellent training program. Very practical and relevant to my work.' : null,
          
          // Skills gained
          skillsGained: (() => {
            const skillsMap: { [key: string]: string[] } = {
              'basic_housekeeping': ['Efficient cleaning techniques', 'Organization skills', 'Time management'],
              'customer_service': ['Communication skills', 'Problem solving', 'Professional behavior'],
              'first_aid': ['Emergency response', 'Medical assistance', 'Safety awareness'],
              'cooking_skills': ['Culinary techniques', 'Menu planning', 'Food presentation']
            };
            return skillsMap[trainingType] || ['Professional skills', 'Industry knowledge'];
          })(),
          
          // Cost and funding
          cost: Math.floor(Math.random() * 50000) + 25000, // 25,000 - 75,000 RWF
          fundingSource: Math.random() > 0.6 ? 'HouseHelp Scholarship' : 
                        Math.random() > 0.3 ? 'Government Program' : 'Self-funded',
          scholarshipAmount: Math.random() > 0.6 ? Math.floor(Math.random() * 50000) + 25000 : 0,
          
          // Attendance
          attendanceRate: status !== 'enrolled' ? Math.floor(Math.random() * 20) + 80 : null, // 80-100%
          missedSessions: status !== 'enrolled' ? Math.floor(Math.random() * 3) : null, // 0-2 sessions
          
          // Follow-up
          requiresFollowUp: Math.random() > 0.7,
          followUpDate: Math.random() > 0.7 ? 
            new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000) : null, // Next 90 days
          mentorAssigned: Math.random() > 0.8,
          
          // Integration with platform
          skillsAddedToProfile: ['completed', 'certified'].includes(status),
          badgeEarned: status === 'certified',
          profileBoostApplied: ['completed', 'certified'].includes(status),
          recommendationsUnlocked: status === 'certified',
          
          // Metadata
          createdAt: enrollmentDate,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'Training System',
          lastModifiedBy: status === 'in_progress' ? 'Training Coordinator' : 'System',
          
          // Quality assurance
          isVerified: ['completed', 'certified'].includes(status),
          verifiedBy: ['completed', 'certified'].includes(status) ? 'Training Manager' : null,
          verificationDate: ['completed', 'certified'].includes(status) ? endDate : null
        };

        await adminDb.collection('worker_training').add(trainingData);
      }
      
      console.log(`✅ Training records created for: ${worker.firstName} ${worker.lastName} (${trainingCount} trainings)`);
    }

    console.log('\n📊 Training Statistics:');
    const trainingSnapshot = await adminDb.collection('worker_training').get();
    const allTrainings = trainingSnapshot.docs.map(doc => doc.data());

    console.log(`Total training records: ${allTrainings.length}`);
    
    console.log('\nBy Status:');
    trainingStatuses.forEach(status => {
      const count = allTrainings.filter(t => t.status === status).length;
      console.log(`  ${status}: ${count} trainings`);
    });
    
    console.log('\nBy Category:');
    const categories = ['cleaning', 'care', 'culinary', 'soft_skills', 'safety', 'general'];
    categories.forEach(category => {
      const count = allTrainings.filter(t => t.category === category).length;
      console.log(`  ${category}: ${count} trainings`);
    });
    
    const certifiedCount = allTrainings.filter(t => t.isCertified).length;
    console.log(`\nCertified trainings: ${certifiedCount} (${Math.round(certifiedCount / allTrainings.length * 100)}%)`);
    
    const completedTrainings = allTrainings.filter(t => t.status === 'completed' && t.score);
    if (completedTrainings.length > 0) {
      const avgScore = completedTrainings.reduce((sum, t) => sum + (t.score || 0), 0) / completedTrainings.length;
      console.log(`Average completion score: ${Math.round(avgScore)}%`);
    }

  } catch (error) {
    console.error('❌ Error creating training records:', error);
  }
}

createTrainingRecords();
