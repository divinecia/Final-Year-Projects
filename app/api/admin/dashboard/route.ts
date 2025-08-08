

/**
 * API Route: /api/admin/dashboard
 *
 * Returns admin dashboard summary, activity, and recent data for UI consumption.
 * Optimized for maintainability, type safety, and performance.
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, getCountFromServer, where, Timestamp } from 'firebase/firestore';

// Utility: Safely convert Firestore Timestamp or Date to ISO string
function toIsoString(date: unknown): string {
  if (
    typeof date === 'object' &&
    date !== null &&
    'toDate' in date &&
    typeof (date as { toDate: () => Date }).toDate === 'function'
  ) {
    return (date as { toDate: () => Date }).toDate().toISOString();
  }
  if (date instanceof Date) return date.toISOString();
  return new Date().toISOString();
}


/**
 * Dashboard statistics summary.
 */
type DashboardStats = {
  totalWorkers: number;
  totalHouseholds: number;
  jobsCompleted: number;
  totalRevenue: number;
};


/**
 * Summary of a worker for dashboard display.
 */
type WorkerSummary = {
  id: string;
  fullName: string;
  email: string;
  services: string[];
  status: string;
  createdAt: string;
};


/**
 * Summary of a job posting for dashboard display.
 */
type JobSummary = {
  id: string;
  jobTitle: string;
  householdName: string;
  serviceType: string;
  status: string;
  salary: number;
  createdAt: string;
};


/**
 * Activity metrics for the dashboard (last 30 days).
 */
type DashboardActivity = {
  newWorkersThisMonth: number;
  newJobsThisMonth: number;
};


/**
 * Full dashboard API response structure.
 */
type DashboardResponse = {
  stats: DashboardStats;
  activity: DashboardActivity;
  recentData: {
    workers: WorkerSummary[];
    jobs: JobSummary[];
  };
};


/**
 * GET /api/admin/dashboard
 * Returns admin dashboard summary, activity, and recent data.
 *
 * @returns {DashboardResponse}
 */
// Main GET handler for dashboard summary
export async function GET() {
  try {
    // --- Dashboard statistics ---
    const [workersSnap, householdsSnap, completedJobsSnap] = await Promise.all([
      getCountFromServer(collection(db, 'workers')),
      getCountFromServer(collection(db, 'households')),
      getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'completed')))
    ]);

    // --- Total revenue from completed payments ---
    let totalRevenue = 0;
    try {
      const paymentsQuery = query(
        collection(db, 'servicePayments'),
        where('status', '==', 'completed')
      );
      const paymentsSnap = await getDocs(paymentsQuery);
      totalRevenue = paymentsSnap.docs.reduce((sum, doc) => {
        const amount = Number(doc.data().amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    } catch {
      // Fallback to estimated revenue if payments collection is empty
      totalRevenue = (completedJobsSnap.data().count ?? 0) * 25000; // Average job value
    }

    // --- Recent worker registrations ---
    const recentWorkersQuery = query(
      collection(db, 'workers'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentWorkersSnap = await getDocs(recentWorkersQuery);
    const recentWorkers: WorkerSummary[] = recentWorkersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || 'N/A',
        email: data.email || 'N/A',
        services: Array.isArray(data.services) ? data.services : [],
        status: data.status || 'pending',
        createdAt: toIsoString(data.createdAt),
      };
    });

    // --- Recent job postings ---
    const recentJobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentJobsSnap = await getDocs(recentJobsQuery);
    const recentJobs: JobSummary[] = recentJobsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobTitle: data.jobTitle || 'N/A',
        householdName: data.householdName || 'N/A',
        serviceType: data.serviceType || 'N/A',
        status: data.status || 'open',
        salary: Number(data.salary) || 0,
        createdAt: toIsoString(data.createdAt),
      };
    });

    // --- Platform activity metrics (last 30 days) ---
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [newWorkersThisMonth, newJobsThisMonth] = await Promise.all([
      getCountFromServer(query(
        collection(db, 'workers'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      )),
      getCountFromServer(query(
        collection(db, 'jobs'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      ))
    ]);

    // --- Compose response ---
    const dashboardData: DashboardResponse = {
      stats: {
        totalWorkers: workersSnap.data().count ?? 0,
        totalHouseholds: householdsSnap.data().count ?? 0,
        jobsCompleted: completedJobsSnap.data().count ?? 0,
        totalRevenue,
      },
      activity: {
        newWorkersThisMonth: newWorkersThisMonth.data().count ?? 0,
        newJobsThisMonth: newJobsThisMonth.data().count ?? 0,
      },
      recentData: {
        workers: recentWorkers,
        jobs: recentJobs,
      }
    };

    // --- Return JSON response (add cache header for 30s if desired) ---
    const response = NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Admin dashboard data retrieved successfully'
    });
    response.headers.set('Cache-Control', 'public, max-age=30');
    return response;

  } catch (error) {
    // Improved error logging for debugging
    console.error('[API] Error fetching admin dashboard data:', error instanceof Error ? error.stack : error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data'
    }, { status: 500 });
  }
}
