
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Briefcase, CalendarCheck2, Star, Wallet, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getWorkerDashboardStats, getNewJobOpportunities, type WorkerDashboardStats } from "./actions"
import type { Job } from "../jobs/actions"
import { serviceOptions } from "@/lib/services";
import Link from "next/link";
import { ArrivalConfirmation } from "./arrival-confirmation";

export default function WorkerDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [stats, setStats] = React.useState<WorkerDashboardStats | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    interface NotificationPreview {
        id: string;
        title?: string;
    }
    interface ReviewSummary {
        reviews: Array<{ id: string; rating: number; comment: string }>;
    }
    const [notifications, setNotifications] = React.useState<NotificationPreview[]>([]);
    const [notificationsLoading, setNotificationsLoading] = React.useState(true);
    const [reviewsSummary, setReviewsSummary] = React.useState<ReviewSummary | null>(null);
    const [reviewsLoading, setReviewsLoading] = React.useState(true);

    // Rwanda insurance companies (sample)
    const insuranceCompanies = [
        { id: 'sonarwa', name: 'SONARWA' },
        { id: 'radiant', name: 'RADIANT' },
        { id: 'sanlam', name: 'SANLAM' },
        { id: 'prime', name: 'PRIME Insurance' },
        { id: 'corar', name: 'CORAR' },
    ];
    // Default insurance selection (could be made dynamic in settings)
    const selectedInsurance = insuranceCompanies[0];
    // EjoHeza deduction rate (2025): 5%
    const EJOHEZA_RATE = 0.05;
    // Insurance fee (example): 2%
    const INSURANCE_RATE = 0.02;
    // VAT (Rwanda): 18%
    const VAT_RATE = 0.18;
    // Helper to calculate breakdown for a salary
    function getEarningsBreakdown(salary: number) {
        const vat = salary * VAT_RATE;
        const insurance = salary * INSURANCE_RATE;
        const ejoheza = salary * EJOHEZA_RATE;
        const net = salary - vat - insurance - ejoheza;
        return {
            gross: salary,
            vat,
            insurance,
            ejoheza,
            net,
        };
    }
    // Helper to render breakdown
    function EarningsBreakdown({ salary }: { salary: number }) {
        const breakdown = getEarningsBreakdown(salary);
        return (
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <div><span className="font-semibold">Gross:</span> {formatCurrency(breakdown.gross)}</div>
                <div><span className="font-semibold">VAT (18%):</span> {formatCurrency(breakdown.vat)}</div>
                <div><span className="font-semibold">Insurance (2%):</span> {formatCurrency(breakdown.insurance)} <span className="ml-1">({selectedInsurance.name})</span></div>
                <div><span className="font-semibold">EjoHeza (5%):</span> {formatCurrency(breakdown.ejoheza)}</div>
                <div><span className="font-semibold">Net:</span> <span className="text-primary font-bold">{formatCurrency(breakdown.net)}</span></div>
            </div>
        );
    }

    // Fetch dashboard stats and jobs
    React.useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                try {
                    const [statsData, jobsData] = await Promise.all([
                        getWorkerDashboardStats(user.uid),
                        getNewJobOpportunities(),
                    ]);
                    setStats(statsData);
                    setJobs(jobsData);
                } catch (error) {
                    let message = "Could not load your dashboard data.";
                    if (error && typeof error === "object" && "message" in error && typeof (error as { message: string }).message === "string") {
                        message = (error as { message: string }).message;
                    }
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: message
                    });
                } finally {
                    setLoading(false);
                }
            }
        };
        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading, toast]);

    // Fetch notifications preview
    React.useEffect(() => {
        const fetchNotifications = async () => {
            if (user) {
                setNotificationsLoading(true);
                try {
                    const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore");
                    const { db } = await import("@/lib/firebase");
                    const q = query(
                        collection(db, "notifications"),
                        where("userId", "==", user.uid),
                        orderBy("createdAt", "desc")
                    );
                    const querySnapshot = await getDocs(q);
                    setNotifications(querySnapshot.docs.slice(0, 3).map(doc => ({ id: doc.id, ...doc.data() })));
                } catch {
                    setNotifications([]);
                } finally {
                    setNotificationsLoading(false);
                }
            }
        };
        if (user) fetchNotifications();
    }, [user]);

    // Fetch recent messages preview
    React.useEffect(() => {
        const fetchMessagesPreview = async () => {
            if (user) {
                try {
                    const { getConversations } = await import("../../household/messaging/actions");
                    await getConversations(user.uid);
                    // Message preview functionality removed for now
                } catch {
                    // Handle error silently
                }
            }
        };
        if (user) fetchMessagesPreview();
    }, [user]);

    // Fetch reviews summary
    React.useEffect(() => {
        const fetchReviews = async () => {
            if (user) {
                setReviewsLoading(true);
                try {
                    const { getWorkerReviews } = await import("../reviews/actions");
                    const summary = await getWorkerReviews(user.uid);
                    setReviewsSummary(summary);
                } catch {
                    setReviewsSummary(null);
                } finally {
                    setReviewsLoading(false);
                }
            }
        };
        if (user) fetchReviews();
    }, [user]);
    
    const handleConfirmArrival = async (jobId: string) => {
        // Update job status to 'arrived'
        // Send notification to household
        console.log('Confirming arrival for job:', jobId);
    };

    const handleUpdateETA = async (jobId: string, eta: string) => {
        // Update ETA and notify household
        console.log('Updating ETA for job:', jobId, 'to:', eta);
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
    };

    const getServiceName = (serviceId: string) => {
        return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    };


  // ...existing code...
  return (
    <div className="space-y-8">
      {/* Top row: Profile, Notifications, Messaging */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile completion */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>Complete your profile to get more job offers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={75} className="w-full md:w-1/2" />
              <span className="text-sm font-medium">75% Complete</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild><Link href="/worker/settings">Complete Profile <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </CardFooter>
        </Card>
        
        {/* Arrival Confirmation */}
        <ArrivalConfirmation 
          assignment={null}
          onConfirmArrival={handleConfirmArrival}
          onUpdateETA={handleUpdateETA}
        />
        
        {/* Notifications preview */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent alerts and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notificationsLoading ? (
                <Skeleton className="h-6 w-32 mb-2" />
              ) : notifications.length > 0 ? (
                notifications.map((n) => {
                  // Type guard for notification
                  if (!n || typeof n !== 'object' || typeof n.id !== 'string') return null;
                  const title = typeof n.title === 'string' ? n.title : '';
                  return (
                    <div key={n.id} className="flex items-center gap-2">
                      <Badge className="bg-primary text-white">{title.includes("job") ? "Job" : title.includes("payment") ? "Payment" : title.includes("message") ? "Message" : "Other"}</Badge>
                      <span className="text-sm">{title || "Notification"}</span>
                    </div>
                  );
                })
              ) : (
                <span className="text-sm text-muted-foreground">No notifications yet.</span>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full"><Link href="/worker/notifications">View All</Link></Button>
          </CardFooter>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* ...existing stats cards... */}
        {/* Open Jobs, Upcoming Jobs, Rating, Earnings */}
        {/* ...existing code... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-8" /> : <div className="text-2xl font-bold">{stats?.jobInvitations}</div>}
             <p className="text-xs text-muted-foreground">Available jobs matching your skills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-8" /> : <div className="text-2xl font-bold">{stats?.upcomingJobs}</div>}
            <p className="text-xs text-muted-foreground">Jobs in your schedule</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold flex items-center">{stats?.rating.toFixed(1)} <Star className="h-5 w-5 ml-1 text-yellow-400 fill-yellow-400" /></div>}
            <p className="text-xs text-muted-foreground">Your average review score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month&apos;s Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{formatCurrency(stats?.monthEarnings ?? 0)}</div>}
            <p className="text-xs text-muted-foreground">Total net earnings this month after VAT (18%), insurance (2%), and EjoHeza (5%) deductions.</p>
            {stats?.monthEarnings && (
                <EarningsBreakdown salary={stats.monthEarnings} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* New jobs section ...existing code... */}
      <div>
        <Card>
            <CardHeader>
                <CardTitle>New Job Opportunities</CardTitle>
                <CardDescription>
                    Jobs that match your skills and availability.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {loading ? (
                        <>
                            <div className="block sm:flex items-start justify-between p-4 border rounded-lg gap-4">
                                <div className="flex-1 mb-4 sm:mb-0">
                                <Skeleton className="h-5 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/4" />
                                    <div className="flex items-center flex-wrap gap-2 mt-2">
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                        <Skeleton className="h-5 w-24 rounded-full" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0">
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-9 w-28" />
                                </div>
                            </div>
                            <div className="block sm:flex items-start justify-between p-4 border rounded-lg gap-4">
                                <div className="flex-1 mb-4 sm:mb-0">
                                    <Skeleton className="h-5 w-1/3 mb-2" />
                                    <Skeleton className="h-4 w-1/4" />
                                    <div className="flex items-center flex-wrap gap-2 mt-2">
                                        <Skeleton className="h-5 w-28 rounded-full" />
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0">
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-9 w-28" />
                                </div>
                            </div>
                        </>
                    ) : jobs.length > 0 ? (
                        jobs.map(job => (
                            <div key={job.id} className="block sm:flex items-start justify-between p-4 border rounded-lg gap-4">
                                <div className="flex-1 mb-4 sm:mb-0">
                                   <p className="font-semibold">{job.jobTitle}</p>
                                   <p className="text-sm text-muted-foreground">{job.householdName}</p>
                                     <div className="flex items-center flex-wrap gap-2 mt-2">
                                        <Badge variant="secondary">{getServiceName(job.serviceType)}</Badge>
                                        <Badge variant="outline" className="capitalize">{job.payFrequency.replace('_', '-')}</Badge>
                                    </div>
                                   <EarningsBreakdown salary={job.salary} />
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0">
                                    <p className="text-lg font-bold">{formatCurrency(getEarningsBreakdown(job.salary).net)}</p>
                                    <Button size="sm" asChild><Link href="/worker/jobs">View & Apply</Link></Button>
                                    <div className="mt-2 text-xs text-muted-foreground">Insurance: <span className="font-semibold">{selectedInsurance.name}</span> | EjoHeza: <span className="font-semibold">5%</span></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No new job opportunities right now.</p>
                    )}
                 </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/worker/jobs">See All Jobs</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>

      {/* Reviews summary */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Latest Reviews</CardTitle>
            <CardDescription>Your recent feedback from households</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewsLoading ? (
                <Skeleton className="h-6 w-32 mb-2" />
              ) : reviewsSummary && Array.isArray(reviewsSummary.reviews) && reviewsSummary.reviews.length > 0 ? (
                reviewsSummary.reviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold">{review.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">“{review.comment}”</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No reviews yet.</span>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full"><Link href="/worker/reviews">See All Reviews</Link></Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic';
