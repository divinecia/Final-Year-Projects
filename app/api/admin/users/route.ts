import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, addDoc } from 'firebase/firestore';
import { z } from 'zod';

// Schema for user query parameters
const UserQuerySchema = z.object({
  type: z.enum(['worker', 'household', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
  search: z.string().optional(),
});

// Schema for user status update (used in PATCH route)
// const UpdateUserStatusSchema = z.object({
//   status: z.enum(['active', 'inactive', 'suspended']),
//   reason: z.string().optional(),
// });

// Schema for creating a new user
const CreateUserSchema = z.object({
  userType: z.enum(['worker', 'household', 'admin']),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).default('pending'),
  // Additional fields can be added here as needed
});


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = UserQuerySchema.parse(params);
    
    let users: Record<string, unknown>[] = [];
    
    // Get users based on type
    const userTypes = validatedParams.type ? [validatedParams.type] : ['worker', 'household', 'admin'];
    
    for (const userType of userTypes) {
      const collectionName = userType === 'admin' ? 'admins' : userType;
      const queryConstraints: import('firebase/firestore').QueryConstraint[] = [orderBy('createdAt', 'desc')];
      if (validatedParams.status) {
        queryConstraints.unshift(where('status', '==', validatedParams.status));
      }
      if (validatedParams.limit) {
        queryConstraints.push(limit(validatedParams.limit));
      }
      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const typeUsers = querySnapshot.docs.map(doc => {
        const data = doc.data() ?? {};
        return {
          id: doc.id,
          userType: userType,
          fullName: typeof data.fullName === 'string' ? data.fullName : 'N/A',
          email: typeof data.email === 'string' ? data.email : 'N/A',
          phone: typeof data.phone === 'string' ? data.phone : 'N/A',
          status: typeof data.status === 'string' ? data.status : 'active',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastActive: data.lastActive?.toDate?.()?.toISOString() || null,
          // Type-specific fields
          ...(userType === 'worker' && {
            services: Array.isArray(data.services) ? data.services : [],
            rating: typeof data.rating === 'number' ? data.rating : 0,
            completedJobs: typeof data.completedJobs === 'number' ? data.completedJobs : 0,
          }),
          ...(userType === 'household' && {
            activeJobs: typeof data.activeJobs === 'number' ? data.activeJobs : 0,
            totalSpent: typeof data.totalSpent === 'number' ? data.totalSpent : 0,
          }),
          ...(userType === 'admin' && {
            role: typeof data.role === 'string' ? data.role : 'support_agent',
            department: typeof data.department === 'string' ? data.department : 'N/A',
          }),
        };
      });
      users = users.concat(typeUsers);
    }
    
    // Filter by search term if provided
    if (validatedParams.search) {
      const searchTerm = validatedParams.search.toLowerCase();
      users = users.filter(user => {
        const fullName = typeof user.fullName === 'string' ? user.fullName : '';
        const email = typeof user.email === 'string' ? user.email : '';
        const phone = typeof user.phone === 'string' ? user.phone : '';
        return (
          fullName.toLowerCase().includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm) ||
          phone.includes(searchTerm)
        );
      });
    }
    
    // Calculate user statistics
    const stats = {
      total: users.length,
      byType: {
        worker: users.filter(u => u.userType === 'worker').length,
        household: users.filter(u => u.userType === 'household').length,
        admin: users.filter(u => u.userType === 'admin').length,
      },
      byStatus: {
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        pending: users.filter(u => u.status === 'pending').length,
        suspended: users.filter(u => u.status === 'suspended').length,
      }
    };
    
    return NextResponse.json({
      success: true,
      data: users,
      stats,
      total: users.length,
      message: 'Users retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = CreateUserSchema.parse(body);

    // Determine collection name
    const collectionName = validatedData.userType === 'admin' ? 'admins' : validatedData.userType;

    // Add createdAt and updatedAt timestamps
    const newUser = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create new user document
    const docRef = await addDoc(collection(db, collectionName), newUser);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...newUser },
      message: 'User created successfully',
    });
  } catch (error) {
    // error is intentionally unused except for logging
    console.error('Error creating user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create user',
    }, { status: 500 });
  }
}
