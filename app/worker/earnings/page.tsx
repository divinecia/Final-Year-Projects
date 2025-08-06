
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Wallet } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getWorkerEarnings, type EarningsSummary } from "./actions"

const SkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
    </TableRow>
);

export default function WorkerEarningsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [summary, setSummary] = React.useState<EarningsSummary | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const fetchEarnings = async () => {
            if (user) {
                setLoading(true);
                try {
                    const earningsData = await getWorkerEarnings(user.uid);
                    setSummary(earningsData);
                } catch {
                    toast({ variant: "destructive", title: "Error", description: "Could not fetch earnings data." });
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!authLoading) {
            fetchEarnings();
        }
    }, [user, authLoading, toast]);


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'failed': return <Badge variant="destructive" className="bg-red-100 text-red-800">Failed</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Earnings</h1>
                <p className="text-muted-foreground">Track your payments and manage your finances.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Earnings This Month</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-36" /> : <div className="text-2xl font-bold">{formatCurrency(summary?.monthEarnings ?? 0)}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {loading ? <Skeleton className="h-8 w-40" /> : <div className="text-2xl font-bold">{formatCurrency(summary?.totalEarnings ?? 0)}</div>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>A complete record of all payments you&apos;ve received.</CardDescription>
                        </div>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Statement
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Household</TableHead>
                                <TableHead>Net Amount (RWF)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : summary && summary.history.length > 0 ? (
                                summary.history.map((p) => (
                                     <TableRow key={p.id}>
                                        <TableCell>{p.date}</TableCell>
                                        <TableCell className="font-mono text-xs">{p.jobId.substring(0,8)}...</TableCell>
                                        <TableCell className="font-medium">{p.householdName}</TableCell>
                                        <TableCell>{formatCurrency(p.netAmount)}</TableCell>
                                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No earnings recorded yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="outline">Load More</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
