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
          if (createdAt.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) && createdAt.getFullYear() === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear())) {
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
  
  /**
   * Represents a data point for growth charts.
   */
  export type GrowthDataPoint = {
    date: string; // e.g., "YYYY-MM-DD"
    count: number;
  };
  
  /**
   * Represents the structure for platform growth data.
   */
  export type PlatformGrowthData = {
    adminGrowth: GrowthDataPoint[];
    householdGrowth: GrowthDataPoint[];
    workerGrowth: GrowthDataPoint[];
  };
  
  /**
   * Fetches platform growth data by counting users created over time.
   * @returns {Promise<PlatformGrowthData>} Growth data for admin, households, and workers.
   */
  export async function getPlatformGrowthData(): Promise<PlatformGrowthData> {
    const collectionsToTrack = [
      { name: 'admin', key: 'adminGrowth' },
      { name: 'households', key: 'householdGrowth' },
      { name: 'workers', key: 'workerGrowth' },
    ];
  
    const growthData: PlatformGrowthData = {
      adminGrowth: [],
      householdGrowth: [],
      workerGrowth: [],
    };
  
    try {
      for (const { name, key } of collectionsToTrack) {
        const q = query(collection(db, name), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
  
        const dailyCounts: { [date: string]: number } = {};
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
          const dateString = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
          dailyCounts[dateString] = (dailyCounts[dateString] ?? 0) + 1;
        });
  
        growthData[key as keyof PlatformGrowthData] = Object.keys(dailyCounts)
          .sort()
          .map(date => ({ date, count: dailyCounts[date] }));
      }
    } catch (error) {
      console.error('Error fetching platform growth data:', error);
    }
  
    return growthData;
  }
  
  /**
   * Represents job lifecycle data.
   */
  export type JobLifecycleData = {
    [status: string]: number;
  };
  
  /**
   * Fetches job lifecycle data by counting jobs in each status.
   * @returns {Promise<JobLifecycleData>} Job counts by status.
   */
  export async function getJobLifecycleData(): Promise<JobLifecycleData> {
    const jobLifecycleData: JobLifecycleData = {};
  
    try {
      const jobsCollection = collection(db, 'jobs');
      const querySnapshot = await getDocs(jobsCollection);
  
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const status = data.status ?? 'unknown';
        jobLifecycleData[status] = (jobLifecycleData[status] ?? 0) + 1;
      });
    } catch (error) {
      console.error('Error fetching job lifecycle data:', error);
    }
  
    return jobLifecycleData;
  }
  
  /**
   * Represents revenue streams data.
   */
  export type RevenueStreamsData = {
    totalRevenue: number;
    platformFees: number;
  revenueByService: { [serviceType: string]: number };
    // Add other revenue streams as needed
  };
  
  /**
   * Fetches revenue streams data from completed service payments.
   * @returns {Promise<RevenueStreamsData>} Revenue breakdown.
   */
  export async function getRevenueStreamsData(): Promise<RevenueStreamsData> {
    let totalRevenue = 0;
    let platformFees = 0;
    const revenueByService: { [serviceType: string]: number } = {};
  
    try {
      const paymentsQuery = query(
        collection(db, 'servicePayments'),
        where('status', '==', 'completed')
      );
      const paymentsSnap = await getDocs(paymentsQuery);
  
      paymentsSnap.docs.forEach(doc => {
        const data = doc.data();
        const amount = Number(data.amount) || 0;
        const platformFee = Number(data.platformFee) || 0;
  
        totalRevenue += amount;
        platformFees += platformFee;
 const serviceType = data.serviceType ?? 'unknown'; // Assuming serviceType is on payment doc, adjust if needed
 revenueByService[serviceType] = (revenueByService[serviceType] ?? 0) + amount;
      });
    } catch (error) {
      console.error('Error fetching revenue streams data:', error);
    }
  
    return {
      totalRevenue,
      platformFees,
 revenueByService,
    };
  }
  
  /**
   * Represents service demand data.
   */
  export type ServiceDemandData = {
    [serviceType: string]: number;
  };
  
  /**
   * Fetches service demand data by counting jobs for each service type.
   * @returns {Promise<ServiceDemandData>} Service counts by type.
   */
  export async function getServiceDemandData(): Promise<ServiceDemandData> {
    // Example: count jobs for each serviceType
    const serviceDemandData: ServiceDemandData = {};
  
    try {
      const jobsCollection = collection(db, 'jobs');
      const querySnapshot = await getDocs(jobsCollection);
  
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const serviceType = data.serviceType ?? 'unknown';
        serviceDemandData[serviceType] = (serviceDemandData[serviceType] ?? 0) + 1;
      });
    } catch (error) {
      console.error('Error fetching service demand data:', error);
    }
  
    return serviceDemandData;
  }
  
/**
 * Fetches all admin accounts.
 * @returns {Promise<any[]>} Array of admin account data.
 */
export async function getAllAdminAccounts(): Promise<any[]> {
  try {
    const adminCollectionRef = collection(db, 'admin');
    const querySnapshot = await getDocs(adminCollectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching admin accounts:', error);
    return [];
  }
}

/**
 * Fetches all household accounts.
 * @returns {Promise<any[]>} Array of household account data.
 */
export async function getAllHouseholdAccounts(): Promise<any[]> {
  try {
    const householdCollectionRef = collection(db, 'households');
    const querySnapshot = await getDocs(householdCollectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching household accounts:', error);
    return [];
  }
}

/**
 * Fetches all worker accounts.
 * @returns {Promise<any[]>} Array of worker account data.
 */
export async function getAllWorkerAccounts(): Promise<any[]> {
  try {
    const workerCollectionRef = collection(db, 'workers');
    const querySnapshot = await getDocs(workerCollectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching worker accounts:', error);
    return [];
  }
}


  // Note: Importing getUserCollection from '@/lib/database' was considered,
  // but direct collection names ('admin', 'households', 'workers') are
  // already used elsewhere in this file and seem sufficient based on the
  // current file's structure and imports. If the database structure
  // abstraction is strictly required, the approach would need adjustment.
  
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
 // Placeholder implementation - replace with actual data fetching if tax fees are dynamic
 // For now, hardcode standard Rwandan rates (example)
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
      // Add new dashboard data types here
      platformGrowth: PlatformGrowthData;
      jobLifecycle: JobLifecycleData;
      revenueStreams: RevenueStreamsData;
      serviceDemand: ServiceDemandData;
      // Add types for worker performance and geographical data when implemented
  };
  
  /**
   * Fetches dashboard statistics for admin overview.
   * Returns total workers, households, completed jobs, and revenue,
   * along with data for growth, job lifecycle, revenue, and service demand charts.
   */
  export async function getDashboardStats(): Promise<DashboardStats> {
      try {
          const [workersSnap, householdsSnap, completedJobsSnap, platformGrowth, jobLifecycle, revenueStreams, serviceDemand] = await Promise.all([
              getCountFromServer(collection(db, 'workers')),
              getCountFromServer(collection(db, 'households')),
              getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'completed'))),
              getPlatformGrowthData(),
              getJobLifecycleData(),
              getRevenueStreamsData(),
              getServiceDemandData(),
          ]);
  
          // Calculate total revenue from completed payments (keep existing logic for safety)
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
              platformGrowth,
              jobLifecycle,
              revenueStreams,
              serviceDemand,
          };
      } catch (error) {
          console.error("Error fetching dashboard stats:", error);
          // Return default values including empty data for new fields
          return {
              totalWorkers: 0,
              totalHouseholds: 0,
              jobsCompleted: 0,
              totalRevenue: 0,
              platformGrowth: { adminGrowth: [], householdGrowth: [], workerGrowth: [] },
              jobLifecycle: {},
              revenueStreams: { totalRevenue: 0, platformFees: 0, revenueByService: {} },
              serviceDemand: {},
          };
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
  