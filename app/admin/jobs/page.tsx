"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-components"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, FileDown, Trash2, Eye, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { getJobs, deleteJob, type Job, approveJob } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { serviceOptions } from "@/lib/services"
import { MatchDialog } from "./match-dialog"

const SkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
        <TableCell>
            <Skeleton className="h-8 w-8" />
        </TableCell>
    </TableRow>
)

export default function AdminJobsPage() {
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();
    const [isMatchDialogOpen, setIsMatchDialogOpen] = React.useState(false);
    const [selectedJobForMatch, setSelectedJobForMatch] = React.useState<Job | null>(null);

    // Debounce search input
    const [debouncedSearch, setDebouncedSearch] = React.useState(searchTerm);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchJobs = React.useCallback(async () => {
        setLoading(true);
        try {
            const fetchedJobs = await getJobs();
            setJobs(fetchedJobs);
            setFilteredJobs(fetchedJobs);
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch job postings." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    
    React.useEffect(() => {
        const results = jobs.filter(job =>
            job.jobTitle.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            job.householdName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            job.workerName?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
        setFilteredJobs(results);
    }, [debouncedSearch, jobs]);

    const handleMatchClick = (job: Job) => {
        setSelectedJobForMatch(job);
        setIsMatchDialogOpen(true);
    };

    const handleDelete = async (jobId: string, jobTitle: string) => {
        try {
            const result = await deleteJob(jobId);
            if (result.success) {
                toast({ title: "Job Deleted", description: `Job "${jobTitle}" has been deleted.` });
                fetchJobs();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete job." });
        }
    };

    const handleApprove = async (jobId: string, jobTitle: string) => {
        try {
            const result = await approveJob(jobId);
            if (result.success) {
                toast({ title: "Job Approved", description: `Job "${jobTitle}" is now visible to workers.` });
                fetchJobs();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to approve job." });
        }
    };

    // Memoize service name lookup for performance
    const getServiceName = React.useCallback((serviceId: string) => {
        return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>
                    <p className="text-muted-foreground">Approve, monitor, and manage all job postings.</p>
                </div>
                <Button aria-label="Export job list">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export List
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Job Postings</CardTitle>
                            <CardDescription>A list of all jobs posted on the platform.</CardDescription>
                        </div>
                        <div className="w-full sm:w-auto sm:max-w-sm">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search jobs..." 
                                    className="pl-8" 
                                    value={searchTerm}
                                    aria-label="Search jobs"
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Household</TableHead>
                                <TableHead className="hidden md:table-cell">Worker</TableHead>
                                <TableHead className="hidden lg:table-cell">Service Type</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Tax</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.jobTitle}</TableCell>
                                        <TableCell>{job.householdName}</TableCell>
                                        <TableCell className="hidden md:table-cell">{job.workerName || "Unassigned"}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{getServiceName(job.serviceType)}</TableCell>
                                        <TableCell>{job.servicePackage || '-'}</TableCell>
                                        <TableCell>{typeof job.amount === 'number' ? job.amount : '-'}</TableCell>
                                        <TableCell>{job.duration || '-'}</TableCell>
                                        <TableCell>{typeof job.tax === 'number' ? job.tax : '-'}</TableCell>
                                        <TableCell>{job.location || '-'}</TableCell>
                                        <TableCell>{job.createdAt || '-'}</TableCell>
                                        <TableCell>{job.completedAt || '-'}</TableCell>
                                        <TableCell><StatusBadge statusId={job.status} type="job" /></TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost" aria-label="Open actions menu">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        {job.status === 'pending' && (
                                                            <DropdownMenuItem onClick={() => handleApprove(job.id, job.jobTitle)}>
                                                                <Sparkles className="mr-2 h-4 w-4" /> Approve Job
                                                            </DropdownMenuItem>
                                                        )}
                                                        {job.status === 'open' && (
                                                            <DropdownMenuItem onClick={() => handleMatchClick(job)}>
                                                                <Sparkles className="mr-2 h-4 w-4" /> AI Smart Match
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the job posting &ldquo;{job.jobTitle}&rdquo;. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(job.id, job.jobTitle)}>
                                                            Yes, delete job
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : (
                                <TableRow>
                                    <TableCell colSpan={13} className="h-24 text-center">No jobs found.</TableCell>
                                </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {selectedJobForMatch && (
                <MatchDialog
                    open={isMatchDialogOpen}
                    onOpenChange={setIsMatchDialogOpen}
                    job={selectedJobForMatch}
                    onJobAssigned={fetchJobs}
                />
            )}
        </div>
    )
}
