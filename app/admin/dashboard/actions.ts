// Types for insurance and tax stats
export type InsuranceStats = {
  totalCompanies: number;
  topCompany?: string;
};

export type TaxStats = {
  totalTax: number;
  lastMonthTax?: number;
};

/**
 * Fetches insurance stats for dashboard.
 */
export async function getInsuranceStats(): Promise<InsuranceStats> {
  // Example: count insurance companies and get top company by coverage
  const companies = await getInsuranceCompanies();
  let topCompany = '';
  if (companies.length > 0) {
    // For demo, pick the company with most coverage options
    topCompany = companies.reduce((prev, curr) =>
      (curr.coverage.length > prev.coverage.length ? curr : prev)
    ).name;
  }
  return {
    totalCompanies: companies.length,
    topCompany,
  };
}

/**
 * Fetches tax stats for dashboard.
 */
export async function getTaxStats(): Promise<TaxStats> {
  // Example: sum tax from servicePayments (completed only)
  let totalTax = 0;
  let lastMonthTax = 0;
  try {
    const paymentsQuery = query(
      collection(db, 'servicePayments'),
      where('status', '==', 'completed')
    );
    const paymentsSnap = await getDocs(paymentsQuery);
    const now = new Date();
    paymentsSnap.docs.forEach(doc => {
      const data = doc.data();
      const tax = Number(data.tax) || 0;
      totalTax += tax;
      // Check if payment is from last month
      if (data.createdAt) {
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
        if (createdAt.getMonth() === now.getMonth() - 1 && createdAt.getFullYear() === now.getFullYear()) {
          lastMonthTax += tax;
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tax stats:', error);
  }
  return {
    totalTax,
    lastMonthTax,
  };
}
// Type for insurance company
export type InsuranceCompany = {
    id: string;
    name: string;
    phone: string;
    email: string;
    website: string;
    services: string[];
    coverage: string[];
};

// Type for tax fees
export type TaxFees = {
    vat: number;
    serviceFee: number;
    other: number;
};

import { rwandanInsuranceCompanies } from '@/lib/rwanda-insurance';
/**
 * Fetches insurance companies for dashboard display.
 * @returns {Promise<InsuranceCompany[]>} Array of insurance company objects
 */
export async function getInsuranceCompanies(): Promise<InsuranceCompany[]> {
    return rwandanInsuranceCompanies as InsuranceCompany[];
}

/**
 * Fetches tax fees (rates) for dashboard display.
 * @returns {Promise<TaxFees>} Tax fee rates
 */
export async function getTaxFees(): Promise<TaxFees> {
    return {
        vat: 0.18, // 18% VAT
        serviceFee: 0.05, // 5% platform service fee
        other: 0.02 // 2% other fees
    };
}

import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    where,
    getCountFromServer,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData,
} from 'firebase/firestore';
import type { Job } from '../jobs/actions';
import type { Worker } from '../workers/workermanage/actions';

/**
 * Helper to safely format Firestore Timestamp or Date
 * @param date Timestamp or Date or undefined
 * @returns {string} Formatted date string or empty string
 */
function formatDate(date: Timestamp | Date | undefined): string {
    if (!date) return '';
    if (date instanceof Timestamp) {
        return date.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (date instanceof Date) {
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    // Fallback for unexpected types
    return '';
}

export type DashboardStats = {
    totalWorkers: number;
    totalHouseholds: number;
    jobsCompleted: number;
    totalRevenue: number;
};

/**
 * Fetches dashboard statistics for admin overview.
 * Returns total workers, households, completed jobs, and revenue.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const [workersSnap, householdsSnap, completedJobsSnap] = await Promise.all([
            getCountFromServer(collection(db, 'workers')),
            getCountFromServer(collection(db, 'households')),
            getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'completed'))),
        ]);

        // Calculate total revenue from completed payments
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
        } catch (error) {
            // Fallback to estimated revenue if payments collection is empty or error
            totalRevenue = (completedJobsSnap.data().count ?? 0) * 25000; // Average job value
            console.warn("Falling back to estimated revenue:", error);
        }

        return {
            totalWorkers: workersSnap.data().count ?? 0,
            totalHouseholds: householdsSnap.data().count ?? 0,
            jobsCompleted: completedJobsSnap.data().count ?? 0,
            totalRevenue,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { totalWorkers: 0, totalHouseholds: 0, jobsCompleted: 0, totalRevenue: 0 };
    }
}

/**
 * Helper to safely map Firestore worker document to Worker type.
 * @param doc Firestore document snapshot
 * @returns {Worker} Worker object
 */
function mapWorkerDoc(doc: QueryDocumentSnapshot<DocumentData>): Worker {
    const data = doc.data();
    return {
        id: doc.id,
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        status: data.status ?? 'pending',
        dateJoined: formatDate(data.dateJoined),
    } as Worker;
}

/**
 * Fetches the 5 most recent worker registrations.
 * Returns an array of Worker objects with safe defaults.
 */
export async function getRecentWorkerRegistrations(): Promise<Worker[]> {
    try {
        const workersCollection = collection(db, 'workers');
        const q = query(workersCollection, orderBy('dateJoined', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(mapWorkerDoc);
    } catch (error) {
        console.error("Error fetching recent workers:", error);
        return [];
    }
}

/**
 * Helper to safely map Firestore job document to Job type.
 * @param doc Firestore document snapshot
 * @returns {Job} Job object
 */
function mapJobDoc(doc: QueryDocumentSnapshot<DocumentData>): Job {
    const data = doc.data();
    return {
        id: doc.id,
        jobTitle: data.jobTitle ?? 'N/A',
        householdName: data.householdName ?? 'N/A',
        workerName: data.workerName ?? null,
        serviceType: data.serviceType ?? 'N/A',
        status: data.status ?? 'open',
        createdAt: formatDate(data.createdAt),
    } as Job;
}

/**
 * Fetches the 5 most recent job postings.
 * Returns an array of Job objects with safe defaults.
 */
export async function getRecentJobPostings(): Promise<Job[]> {
    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(jobsCollection, orderBy('createdAt', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(mapJobDoc);
    } catch (error) {
        console.error("Error fetching recent jobs:", error);
        return [];
    }
}
