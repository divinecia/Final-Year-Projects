"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-components"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, FileDown, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { getServicePayments, getTrainingPayments, type ServicePayment, type TrainingPayment } from "./actions"
import { useToast } from "@/hooks/use-toast"

const SkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell>
            <Skeleton className="h-8 w-8" />
        </TableCell>
    </TableRow>
)

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(date));
}

export default function AdminPaymentsPage() {
    const [servicePayments, setServicePayments] = React.useState<ServicePayment[]>([]);
    const [trainingPayments, setTrainingPayments] = React.useState<TrainingPayment[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [serviceSearch, setServiceSearch] = React.useState("");
    const [trainingSearch, setTrainingSearch] = React.useState("");
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                const [serviceData, trainingData] = await Promise.all([
                    getServicePayments(),
                    getTrainingPayments()
                ]);
                setServicePayments(serviceData);
                setTrainingPayments(trainingData);
            } catch {
                toast({ variant: "destructive", title: "Error", description: "Could not fetch payments." });
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [toast]);

    // Filtered data based on search
    const filteredServicePayments = servicePayments.filter(p =>
        p.householdName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        p.workerName.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    // Filtered training payments based on search
    const filteredTrainingPayments = trainingPayments.filter(p =>
        p.workerName.toLowerCase().includes(trainingSearch.toLowerCase()) ||
        p.courseTitle.toLowerCase().includes(trainingSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment Transactions</h1>
                    <p className="text-muted-foreground">View and manage all financial transactions.</p>
                </div>
                <Button disabled={loading} aria-disabled={loading}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export View
                </Button>
            </div>
            <Tabs defaultValue="service_payments">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="service_payments">Service Payments</TabsTrigger>
                    <TabsTrigger value="training_payments">Training Payments</TabsTrigger>
                </TabsList>
                <TabsContent value="service_payments">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Household Service Payments</CardTitle>
                                    <CardDescription>Transactions from households for worker services.</CardDescription>
                                </div>
                                <div className="w-full max-w-sm">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search service payments..."
                                            className="pl-8"
                                            value={serviceSearch}
                                            onChange={e => setServiceSearch(e.target.value)}
                                            aria-label="Search service payments"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>From (Household)</TableHead>
                                        <TableHead>To (Worker)</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
                                        filteredServicePayments.length > 0 ? (
                                            filteredServicePayments.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{formatDate(p.date)}</TableCell>
                                                    <TableCell className="font-medium">{p.householdName}</TableCell>
                                                    <TableCell>{p.workerName}</TableCell>
                                                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                                                    <TableCell><StatusBadge statusId={p.status} type="payment" /></TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" aria-label="More actions">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">No service payments found.</TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="training_payments">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Worker Training Payments</CardTitle>
                                    <CardDescription>Transactions from workers for training programs.</CardDescription>
                                </div>
                                <div className="w-full max-w-sm">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search training payments..."
                                            className="pl-8"
                                            value={trainingSearch}
                                            onChange={e => setTrainingSearch(e.target.value)}
                                            aria-label="Search training payments"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Course/Program</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
                                        filteredTrainingPayments.length > 0 ? (
                                            filteredTrainingPayments.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{formatDate(p.date)}</TableCell>
                                                    <TableCell className="font-medium">{p.workerName}</TableCell>
                                                    <TableCell>{p.courseTitle}</TableCell>
                                                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                                                    <TableCell><StatusBadge statusId={p.status} type="payment" /></TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" aria-label="More actions">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">No training payments found.<br /><span className="text-xs text-muted-foreground">If you expect payments, check Firestore for missing fields (date, createdAt, workerName, courseTitle, amount, status).</span></TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            </div>
        )
    }
                                      
