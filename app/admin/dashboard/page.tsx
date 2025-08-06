"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRecentWorkerRegistrations, getRecentJobPostings, type DashboardStats } from "./actions";
import type { Worker } from "../workers/workermanage/actions";
import type { Job } from "../jobs/actions";
import { useToast } from "@/hooks/use-toast";

// StatCard: Reusable card for dashboard stats
type StatCardProps = {
  title: string;
  icon?: React.ReactNode;
  value: React.ReactNode;
  loading: boolean;
  helper?: string;
};
function StatCard({ title, icon, value, loading, helper }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon ?? <span aria-hidden="true" />}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}

// Skeleton row for loading state in tables
const WorkerSkeletonRow: React.FC = () => (
  <TableRow>
    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
  </TableRow>
);

const JobSkeletonRow: React.FC = () => (
  <div className="flex justify-between items-center py-2">
    <div>
      <Skeleton className="h-5 w-40 mb-1" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);

// Memoized skeleton arrays for performance
function useSkeletonRows(Component: React.FC, count: number) {
  return React.useMemo(() => Array.from({ length: count }).map((_, i) => <Component key={i} />), [Component, count]);
}

// Helper to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentWorkers, setRecentWorkers] = React.useState<Worker[]>([]);
  const [recentJobs, setRecentJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { toast } = useToast();

  // Format currency for RWF
  const formatCurrency = React.useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
  }, []);

  // Fetch dashboard data
  React.useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, workersData, jobsData] = await Promise.all([
          getDashboardStats(),
          getRecentWorkerRegistrations(),
          getRecentJobPostings(),
        ]);
        if (isMounted) {
          setStats(statsData);
          setRecentWorkers(workersData);
          setRecentJobs(jobsData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data."
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [toast]);

  // Memoized skeletons for performance
  const workerSkeletons = useSkeletonRows(WorkerSkeletonRow, 3);
  const jobSkeletons = useSkeletonRows(JobSkeletonRow, 3);

  // Helper for empty state
  const renderEmpty = (message: string, colSpan = 1) => (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">{message}</TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workers"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          value={stats?.totalWorkers ?? 0}
          loading={loading}
          helper={"+2 since last month"}
        />
        <StatCard
          title="Total Households"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          value={stats?.totalHouseholds ?? 0}
          loading={loading}
          helper={"+5 since last month"}
        />
        <StatCard
          title="Jobs Completed"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          value={stats?.jobsCompleted ?? 0}
          loading={loading}
          helper={"+10 this month"}
        />
        <StatCard
          title="Total Revenue"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          loading={loading}
          helper={"Based on completed jobs"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Worker Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Worker Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? workerSkeletons
                  : recentWorkers.length > 0
                  ? recentWorkers.map(worker => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.fullName}</TableCell>
                        <TableCell>{worker.email}</TableCell>
                        <TableCell>{formatDate(worker.dateJoined)}</TableCell>
                      </TableRow>
                    ))
                  : renderEmpty("No recent registrations.", 3)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Job Postings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading
                ? jobSkeletons
                : recentJobs.length > 0
                ? recentJobs.map(job => (
                    <div key={job.id} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">{job.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">{job.householdName}</p>
                      </div>
                      <Button variant="outline" size="sm" aria-label={`View job ${job.jobTitle}`}>View</Button>
                    </div>
                  ))
                : <div className="text-center text-muted-foreground py-10">No recent jobs.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
