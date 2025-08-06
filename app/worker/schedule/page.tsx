"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { isSameDay } from "date-fns"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"

type ScheduledJob = {
    id: string;
    jobTitle: string;
    householdName: string;
    householdLocation: string;
    status: 'assigned' | 'completed' | 'cancelled';
    jobDate: Date;
    jobTime: string;
};

// Job details modal implementation
function JobDetailsModal({ job, onClose }: { job: ScheduledJob | null, onClose: () => void }) {
    if (!job) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                <h2 className="text-xl font-bold mb-2">{job.jobTitle}</h2>
                <p className="text-muted-foreground mb-2">{job.householdName}</p>
                <div className="mb-2">Location: <span className="font-semibold">{job.householdLocation}</span></div>
                <div className="mb-2">Date: <span className="font-semibold">{job.jobDate.toLocaleDateString()}</span></div>
                <div className="mb-2">Time: <span className="font-semibold">{job.jobTime}</span></div>
                <div className="mb-2">Status: <Badge variant={job.status === 'completed' ? 'secondary' : job.status === 'cancelled' ? 'destructive' : 'default'}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</Badge></div>
                <Button onClick={onClose} className="mt-4">Close</Button>
            </div>
        </div>
    );
}

const JobCard = ({ job }: { job: ScheduledJob }) => (
    <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-base">{job.jobTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.householdName}</p>
            </div>
            <Badge variant={job.status === 'completed' ? 'secondary' : job.status === 'cancelled' ? 'destructive' : 'default'}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.householdLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{job.jobTime}</span>
            </div>
            <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('showJobDetails', { detail: job }))}>Details</Button>
                {job.status === 'assigned' && <Button size="sm" variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent('rescheduleJob', { detail: job }))}>Reschedule</Button>}
                {job.status === 'assigned' && <Button size="sm" variant="destructive" onClick={() => window.dispatchEvent(new CustomEvent('cancelJob', { detail: job }))}>Cancel</Button>}
            </div>
        </CardContent>
    </Card>
);

const JobCardSkeleton = () => (
    <Card>
        <CardHeader className="pb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
        </CardContent>
    </Card>
);

export default function WorkerSchedulePage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [schedule, setSchedule] = React.useState<ScheduledJob[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedJob, setSelectedJob] = React.useState<ScheduledJob | null>(null);
    const [showReschedule, setShowReschedule] = React.useState(false);
    const [showCancel, setShowCancel] = React.useState(false);

    React.useEffect(() => {
        function handleShowDetails(e: Event) {
            const customEvent = e as CustomEvent;
            setSelectedJob(customEvent.detail);
        }
        function handleReschedule(e: Event) {
            const customEvent = e as CustomEvent;
            setSelectedJob(customEvent.detail);
            setShowReschedule(true);
        }
        function handleCancel(e: Event) {
            const customEvent = e as CustomEvent;
            setSelectedJob(customEvent.detail);
            setShowCancel(true);
        }
        window.addEventListener('showJobDetails', handleShowDetails as EventListener);
        window.addEventListener('rescheduleJob', handleReschedule as EventListener);
        window.addEventListener('cancelJob', handleCancel as EventListener);
        return () => {
            window.removeEventListener('showJobDetails', handleShowDetails as EventListener);
            window.removeEventListener('rescheduleJob', handleReschedule as EventListener);
            window.removeEventListener('cancelJob', handleCancel as EventListener);
        };
    }, []);

    React.useEffect(() => {
        const fetchSchedule = async () => {
            if (user) {
                setLoading(true);
                try {
                    // Fetch actual schedule from Firebase jobs collection
                    const jobsQuery = query(
                        collection(db, 'jobs'),
                        where('workerId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    );
                    
                    const querySnapshot = await getDocs(jobsQuery);
                    const scheduledJobs: ScheduledJob[] = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            jobTitle: data.jobTitle || 'Service Job',
                            householdName: data.householdName || 'Customer',
                            householdLocation: data.location || 'Not specified',
                            status: data.status || 'assigned',
                            jobDate: data.startDate?.toDate() || new Date(),
                            jobTime: data.startTime || '9:00 AM'
                        };
                    });
                    setSchedule(scheduledJobs);
                } catch {
                    toast({ 
                        variant: "destructive", 
                        title: "Error", 
                        description: "Could not load your schedule." 
                    });
                } finally {
                    setLoading(false);
                }
            }
        };
        if (!authLoading) {
            fetchSchedule();
        }
    }, [user, authLoading, toast]);

    const jobsForSelectedDate: ScheduledJob[] = React.useMemo(() => {
        if (!date) return [];
        return Array.isArray(schedule) ? schedule.filter((job: ScheduledJob) => isSameDay(job.jobDate, date)) : [];
    }, [schedule, date]);

    return (
        <div className="p-4">
            <div className="max-w-3xl mx-auto">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="border-2 border-dashed rounded-lg"
                                modifiersStyles={{
                                    scheduled: {
                                        border: "2px solid hsl(var(--primary))",
                                        borderRadius: 'var(--radius)'
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jobs for {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '...'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading ? (
                                <JobCardSkeleton />
                            ) : jobsForSelectedDate.length > 0 ? (
                                jobsForSelectedDate.map(job => <JobCard key={job.id} job={job} />)
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No jobs scheduled for this day.</p>
                            )}
                            {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
                            {showReschedule && selectedJob && (
                                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                                        <h2 className="text-lg font-bold mb-2">Reschedule Job</h2>
                                        <p className="mb-2">Feature coming soon.</p>
                                        <Button onClick={() => setShowReschedule(false)} className="mt-2">Close</Button>
                                    </div>
                                </div>
                            )}
                            {showCancel && selectedJob && (
                                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                                        <h2 className="text-lg font-bold mb-2">Cancel Job</h2>
                                        <p className="mb-2">Feature coming soon.</p>
                                        <Button onClick={() => setShowCancel(false)} className="mt-2">Close</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';