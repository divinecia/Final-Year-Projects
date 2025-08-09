import { NextResponse } from 'next/server';
import { adminDb, adminHelpers } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  try {
    // Get all admin users
    const adminSnapshot = await adminDb.collection('admin').get();
    const admins = adminSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Don't expose sensitive data
      password: undefined
    }));

    return NextResponse.json({
      success: true,
      admins,
      count: admins.length
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, adminData } = body;

    if (action === 'create') {
      const { email, password, fullName, role = 'admin' } = adminData;
      
      if (!email || !password || !fullName) {
        return NextResponse.json({
          success: false,
          error: 'Email, password, and full name are required'
        }, { status: 400 });
      }

      // Create Firebase Auth user
      const userRecord = await adminHelpers.createUserWithClaims({
        email,
        password,
        displayName: fullName,
        customClaims: { role: 'admin' }
      });

      // Create admin document in Firestore
      const adminDoc = {
        userId: userRecord.uid,
        email: userRecord.email,
        fullName,
        role,
        status: 'active',
        permissions: [
          'manage_users',
          'manage_jobs', 
          'manage_payments',
          'view_analytics',
          'system_settings'
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLogin: null,
        profilePicture: null
      };

      await adminDb.collection('admin').doc(userRecord.uid).set(adminDoc);

      return NextResponse.json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: userRecord.uid,
          ...adminDoc,
          password: undefined
        }
      });

    } else if (action === 'seed') {
      // Create default admin account
      const defaultAdmin = {
        email: process.env.ADMIN_EMAIL || 'admin@househelp.rw',
        password: process.env.ADMIN_PASSWORD || '@dM1Nd',
        fullName: 'System Administrator'
      };

      // Check if admin already exists
      try {
        await adminHelpers.getUserByEmail(defaultAdmin.email);
        return NextResponse.json({
          success: false,
          message: 'Default admin already exists'
        }, { status: 409 });
      } catch {
        // User doesn't exist, create it
        const result = await adminHelpers.createUserWithClaims({
          email: defaultAdmin.email,
          password: defaultAdmin.password,
          displayName: defaultAdmin.fullName,
          customClaims: { role: 'admin' }
        });

        const adminDoc = {
          userId: result.uid,
          email: result.email,
          fullName: defaultAdmin.fullName,
          role: 'admin',
          status: 'active',
          permissions: [
            'manage_users',
            'manage_jobs',
            'manage_payments',
            'view_analytics',
            'system_settings'
          ],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastLogin: null,
          profilePicture: null
        };

        await adminDb.collection('admin').doc(result.uid).set(adminDoc);

        return NextResponse.json({
          success: true,
          message: 'Default admin seeded successfully',
          admin: {
            id: result.uid,
            email: result.email,
            fullName: defaultAdmin.fullName
          }
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in admin management:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
