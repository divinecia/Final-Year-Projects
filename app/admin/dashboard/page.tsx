"use client";

export const dynamic = 'force-dynamic'

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Keep Skeleton for loading states
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRecentWorkerRegistrations, getRecentJobPostings, getInsuranceStats, getTaxStats, type DashboardStats, type InsuranceStats, type TaxStats } from "./actions";
import type { Worker } from "../workers/workermanage/actions";
import type { Job } from "../jobs/actions";
import { useToast } from "@/hooks/use-toast";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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

// Main Dashboard Page Component
export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [insuranceStats, setInsuranceStats] = React.useState<InsuranceStats | null>(null);
  const [taxStats, setTaxStats] = React.useState<TaxStats | null>(null);
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
        const [statsData, insuranceData, taxData, workersData, jobsData] = await Promise.all([
          getDashboardStats(),
          getInsuranceStats(),
          getTaxStats(),
          getRecentWorkerRegistrations(),
          getRecentJobPostings(),
        ]);
        if (isMounted) {
          setStats(statsData);
          setInsuranceStats(insuranceData);
          setTaxStats(taxData);
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

  // Data transformation for charts
  const jobLifecycleChartData = React.useMemo(() => {
    if (!stats?.jobLifecycle) return [];
    return Object.keys(stats.jobLifecycle).map(status => ({
      name: status,
      value: stats.jobLifecycle[status],
    }));
  }, [stats?.jobLifecycle]);

  const serviceDemandChartData = React.useMemo(() => {
    if (!stats?.serviceDemand) return [];
    return Object.keys(stats.serviceDemand).map(serviceType => ({
      name: serviceType,
      count: stats.serviceDemand[serviceType],
    }));
  }, [stats?.serviceDemand]);
  
  const revenueByServiceChartData = React.useMemo(() => {
    if (!stats?.revenueStreams?.revenueByService) return [];
    return Object.keys(stats.revenueStreams.revenueByService).map(serviceType => ({
      name: serviceType,
      value: stats.revenueStreams.revenueByService[serviceType],
    }));
  }, [stats?.revenueStreams?.revenueByService]);

  // Define colors for Pie Chart slices
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

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
        <StatCard
          title="Insurance Companies"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          value={insuranceStats?.totalCompanies ?? 0}
          loading={loading}
          helper={insuranceStats?.topCompany ? `Top: ${insuranceStats.topCompany}` : undefined}
        />
        <StatCard
          title="Tax Fees"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          value={formatCurrency(taxStats?.totalTax ?? 0)}
          loading={loading}
          helper={taxStats?.lastMonthTax ? `Last month: ${formatCurrency(taxStats.lastMonthTax)}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Platform Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading || !stats?.platformGrowth ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.platformGrowth.adminGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="Admins" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Job Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {loading || jobLifecycleChartData.length === 0 ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobLifecycleChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {jobLifecycleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Service Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {loading || revenueByServiceChartData.length === 0 ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByServiceChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {revenueByServiceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

         {/* Service Demand Chart */}
         <Card>
          <CardHeader>
            <CardTitle>Service Demand</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading || serviceDemandChartData.length === 0 ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceDemandChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Jobs" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
