"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, FileDown, CheckCircle, XCircle, Trash2, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getWorkers, approveWorker, suspendWorker, deleteWorker, type Worker } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/ui/status-components"

const SkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell>
            <Skeleton className="h-8 w-8" />
        </TableCell>
    </TableRow>
)

export default function AdminWorkersManagePage() {
    const [workers, setWorkers] = React.useState<Worker[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [search, setSearch] = React.useState("");

    const fetchWorkers = React.useCallback(async () => {
        try {
            setLoading(true);
            const fetchedWorkers = await getWorkers();
            setWorkers(fetchedWorkers);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Could not fetch workers from the database.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers, refreshKey]);

    const handleApprove = async (workerId: string, workerName: string) => {
        const result = await approveWorker(workerId);
        if (result.success) {
            toast({
                title: "Worker Approved",
                description: `${workerName} has been verified and is now active.`
            });
            setRefreshKey(oldKey => oldKey + 1);
        } else {
            toast({
                title: "Error",
                description: `Could not approve ${workerName}.`,
                variant: "destructive"
            });
        }
    }

    const handleSuspend = async (workerId: string, workerName: string) => {
        const result = await suspendWorker(workerId);
        if (result.success) {
            toast({
                title: "Worker Suspended",
                description: `${workerName} has been suspended.`
            });
            setRefreshKey(oldKey => oldKey + 1);
        } else {
            toast({
                title: "Error",
                description: `Could not suspend ${workerName}.`,
                variant: "destructive"
            });
        }
    }

    const handleDelete = async (workerId: string, workerName: string) => {
        const result = await deleteWorker(workerId);
        if (result.success) {
            toast({
                title: "Worker Deleted",
                description: `${workerName} has been permanently deleted.`
            });
            setRefreshKey(oldKey => oldKey + 1);
        } else {
            toast({
                title: "Error",
                description: `Could not delete ${workerName}.`,
                variant: "destructive"
            });
        }
    }

    // Filter workers by search input
    const filteredWorkers = React.useMemo(() => {
        if (!search.trim()) return workers;
        const lower = search.toLowerCase();
        return workers.filter(w =>
            w.fullName.toLowerCase().includes(lower) ||
            w.email.toLowerCase().includes(lower) ||
            w.phone.toLowerCase().includes(lower)
        );
    }, [workers, search]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Workers</h1>
                    <p className="text-muted-foreground">Approve, monitor, and manage worker accounts and welfare.</p>
                </div>
                <Button disabled={loading} aria-label="Export worker list">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export List
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Worker Accounts</CardTitle>
                            <CardDescription>A list of all registered workers in the system.</CardDescription>
                        </div>
                        <div className="w-full max-w-sm">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search workers..."
                                    className="pl-8"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    aria-label="Search workers"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : filteredWorkers.length > 0 ? (
                                filteredWorkers.map((worker) => (
                                    <TableRow key={worker.id}>
                                        <TableCell className="font-medium">{worker.fullName}</TableCell>
                                        <TableCell>{worker.email}</TableCell>
                                        <TableCell>{worker.phone}</TableCell>
                                        <TableCell><StatusBadge statusId={worker.status} type="user" /></TableCell>
                                        <TableCell>
                                            {worker.dateJoined
                                                ? new Date(worker.dateJoined).toLocaleDateString()
                                                : "-"}
                                        </TableCell>
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
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" /> View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {worker.status === 'pending' &&
                                                            <DropdownMenuItem
                                                                className="text-green-600 focus:text-green-700"
                                                                onClick={() => handleApprove(worker.id, worker.fullName)}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve Worker
                                                            </DropdownMenuItem>
                                                        }
                                                        {worker.status === 'active' &&
                                                            <DropdownMenuItem
                                                                className="text-orange-600 focus:text-orange-700"
                                                                onClick={() => handleSuspend(worker.id, worker.fullName)}
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" /> Suspend
                                                            </DropdownMenuItem>
                                                        }
                                                        {worker.status === 'suspended' &&
                                                            <DropdownMenuItem
                                                                className="text-green-600 focus:text-green-700"
                                                                onClick={() => handleApprove(worker.id, worker.fullName)}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" /> Re-activate
                                                            </DropdownMenuItem>
                                                        }
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the worker account for {worker.fullName} and remove their data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(worker.id, worker.fullName)}>
                                                            Yes, delete worker
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No workers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
