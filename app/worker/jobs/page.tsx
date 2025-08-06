
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin } from "lucide-react"
import { serviceOptions } from "@/lib/services"
import { getOpenJobs, applyForJob, type Job } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

const JobCard = ({ job, onApply }: { job: Job, onApply: (jobId: string) => void }) => {
    const getServiceName = (serviceId: string) => {
        return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    }
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{job.jobTitle}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <MapPin className="h-4 w-4" /> {job.householdLocation}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{getServiceName(job.serviceType)}</Badge>
                    <Badge variant="outline" className="capitalize">{job.payFrequency.replace('_', '-')}</Badge>
                </div>
                <p className="text-lg font-bold">{formatCurrency(job.salary)}</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => onApply(job.id)}>Apply Now</Button>
            </CardFooter>
        </Card>
    )
}

const JobCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-32" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default function WorkerJobsPage() {
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [filter, setFilter] = React.useState({ service: 'all', type: 'all', search: '' });
    const { toast } = useToast();
    const { user } = useAuth();

    // Filtering logic
    React.useEffect(() => {
        let result = jobs;
        if (filter.service !== 'all') {
            result = result.filter(j => j.serviceType === filter.service);
        }
        if (filter.type !== 'all') {
            result = result.filter(j => j.payFrequency === filter.type);
        }
        if (filter.search) {
            result = result.filter(j => j.jobTitle.toLowerCase().includes(filter.search.toLowerCase()));
        }
        setFilteredJobs(result);
    }, [jobs, filter]);

    const fetchJobs = React.useCallback(async () => {
        setLoading(true);
        try {
            const fetchedJobs = await getOpenJobs();
            setJobs(fetchedJobs);
        } catch {
            setError("Could not fetch jobs.");
            toast({ variant: "destructive", title: "Error", description: "Could not fetch jobs." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleApply = async (jobId: string) => {
        if (!user) {
            toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to apply." });
            return;
        }
        toast({ title: "Applying for job..." });
        const result = await applyForJob(jobId, user.uid);
        if (result.success) {
            toast({ title: "Success!", description: "Your application has been submitted." });
            fetchJobs();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };

    // Job details modal
    function JobDetailsModal({ job, onClose }: { job: Job, onClose: () => void }) {
        if (!job) return null;
        return (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                    <h2 className="text-xl font-bold mb-2">{job.jobTitle}</h2>
                    <p className="text-muted-foreground mb-2">{job.householdName}</p>
                    <div className="mb-2">Service: <Badge>{serviceOptions.find(s => s.id === job.serviceType)?.label || job.serviceType}</Badge></div>
                    <div className="mb-2">Type: <Badge>{job.payFrequency.replace('_', '-')}</Badge></div>
                    <div className="mb-2">Salary: <span className="font-semibold">{job.salary}</span></div>
                    <div className="mb-2">Description: <span>No description provided.</span></div>
                    <Button onClick={onClose} className="mt-4">Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <Input placeholder="Search jobs..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} className="w-full md:w-1/3" />
                <Select value={filter.service} onValueChange={(v: string) => setFilter(f => ({ ...f, service: v }))}>
                    <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {serviceOptions.map(service => (
                            <SelectItem key={service.id} value={service.id}>{service.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filter.type} onValueChange={(v: string) => setFilter(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {error && <div className="text-destructive">{error}</div>}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => <JobCard key={job.id} job={job} onApply={handleApply} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">No jobs found. Try adjusting your filters.</div>
            )}
            {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
        </div>
    );
}
