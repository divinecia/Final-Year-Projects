"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { 
    getHouseholdPaymentHistory, 
    processPayment, 
    getPendingBills, 
    getPaymentMethods, 
    cancelPayment,
    type Payment, 
    type PendingBill, 
    type PaymentMethod 
} from "./actions"
import { serviceOptions } from "@/lib/services"

const HistorySkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell>
            <div className="w-fit">
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
        </TableCell>
    </TableRow>
)

export default function PaymentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    // const router = useRouter();
    
    // State management
    const [history, setHistory] = React.useState<Payment[]>([]);
    const [pendingBills, setPendingBills] = React.useState<PendingBill[]>([]);
    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
    const [loadingHistory, setLoadingHistory] = React.useState(true);
    const [loadingBills, setLoadingBills] = React.useState(true);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [selectedBill, setSelectedBill] = React.useState<PendingBill | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
    
    // Form state
    const [momoNumber, setMomoNumber] = React.useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState("mobile_money");

    // Load all payment data
    const fetchData = React.useCallback(async () => {
        if (user) {
            try {
                const [paymentHistory, bills, methods] = await Promise.all([
                    getHouseholdPaymentHistory(user.uid),
                    getPendingBills(user.uid),
                    getPaymentMethods(user.uid)
                ]);
                
                setHistory(paymentHistory);
                setPendingBills(bills);
                setPaymentMethods(methods);
            } catch {
                toast({ 
                    variant: "destructive", 
                    title: "Error", 
                    description: "Could not load payment data." 
                });
            } finally {
                setLoadingHistory(false);
                setLoadingBills(false);
            }
        }
    }, [user, toast]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePayment = async () => {
        if (!user || !selectedBill) {
            toast({ 
                variant: "destructive", 
                title: "Error", 
                description: "Please select a bill to pay." 
            });
            return;
        }
        
        if (selectedPaymentMethod === 'mobile_money' && (!momoNumber || !/^(07)\d{8}$/.test(momoNumber))) {
            toast({ 
                variant: "destructive", 
                title: "Invalid Phone Number", 
                description: "Please enter a valid 10-digit mobile money number starting with 07." 
            });
            return;
        }

        setIsProcessing(true);
        toast({ title: "Initiating Payment...", description: "Please wait, you will be redirected." });
        
        const result = await processPayment(user.uid, {
            jobId: selectedBill.jobId,
            serviceType: selectedBill.serviceType,
            workerName: selectedBill.workerName,
            workerId: selectedBill.workerId,
            amount: selectedBill.totalAmount,
            phone: momoNumber,
            paymentMethod: selectedPaymentMethod as 'mobile_money' | 'card',
        });

        if (result.success) {
            toast({
                title: "Payment Initiated",
                description: "Please complete the payment on your mobile device"
            });
            
            if (result.redirectUrl) {
                window.open(result.redirectUrl, '_blank');
            }
            
            // Refresh data and close dialog
            await fetchData();
            setPaymentDialogOpen(false);
            setSelectedBill(null);
            setMomoNumber("");
        } else {
            toast({ 
                variant: "destructive", 
                title: "Payment Failed", 
                description: result.error || "Could not initiate the payment process." 
            });
        }
        
        setIsProcessing(false);
    };

    const handleCancelPayment = async (transactionId: string) => {
        if (!user) return;
        
        const result = await cancelPayment(transactionId, user.uid);
        if (result.success) {
            toast({ title: "Payment Cancelled", description: "The payment has been cancelled." });
            await fetchData();
        } else {
            toast({ 
                variant: "destructive", 
                title: "Error", 
                description: result.error || "Could not cancel payment." 
            });
        }
    };

    const openPaymentDialog = (bill: PendingBill) => {
        setSelectedBill(bill);
        setPaymentDialogOpen(true);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>Please log in to access your payments.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">
                        Manage your service payments and billing
                    </p>
                </div>
            </div>

            {/* Pending Bills Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Pending Bills</h2>
                    {loadingBills && <Skeleton className="h-6 w-6 rounded-full" />}
                </div>
                
                {loadingBills ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2].map(i => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : pendingBills.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center space-y-2">
                                <p className="text-muted-foreground">No pending bills</p>
                                <p className="text-sm text-muted-foreground">All your payments are up to date!</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingBills.map((bill) => (
                            <Card key={bill.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{serviceOptions.find(s => s.id === bill.serviceType)?.label || bill.serviceType}</span>
                                        <Badge variant="outline">Due {bill.dueDate}</Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Service by {bill.workerName}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Base Fee</span>
                                            <span>{bill.baseFee.toLocaleString()} RWF</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Platform Fee</span>
                                            <span>{bill.platformFee.toLocaleString()} RWF</span>
                                        </div>
                                        {bill.discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount</span>
                                                <span>-{bill.discount.toLocaleString()} RWF</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>{bill.totalAmount.toLocaleString()} RWF</span>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => openPaymentDialog(bill)}
                                        className="w-full"
                                    >
                                        Pay Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment History Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Payment History</h2>
                
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead className="hidden md:table-cell">Worker</TableHead>
                                <TableHead className="hidden sm:table-cell">Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingHistory ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <HistorySkeletonRow key={i} />
                                ))
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No payment history found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.date}</TableCell>
                                        <TableCell>
                                            {serviceOptions.find(s => s.id === payment.serviceType)?.label || payment.serviceType}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{payment.workerName}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {payment.amount.toLocaleString()} RWF
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={
                                                    payment.status === "completed" ? "default" :
                                                    payment.status === "pending" ? "secondary" : "destructive"
                                                }
                                            >
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {payment.status === "pending" && payment.transactionId && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCancelPayment(payment.transactionId!)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Payment</DialogTitle>
                    </DialogHeader>
                    
                    {selectedBill && (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Service:</span>
                                    <span>{serviceOptions.find(s => s.id === selectedBill.serviceType)?.label}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Worker:</span>
                                    <span>{selectedBill.workerName}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Total Amount:</span>
                                    <span>{selectedBill.totalAmount.toLocaleString()} RWF</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Payment Method</Label>
                                    <RadioGroup 
                                        value={selectedPaymentMethod} 
                                        onValueChange={setSelectedPaymentMethod}
                                        className="mt-2"
                                    >
                                        {paymentMethods.map((method) => (
                                            <div key={method.id} className="flex items-center space-x-2">
                                                <RadioGroupItem 
                                                    value={method.id} 
                                                    id={method.id}
                                                    disabled={!method.enabled}
                                                />
                                                <Label 
                                                    htmlFor={method.id}
                                                    className={`flex items-center gap-2 ${!method.enabled ? 'text-muted-foreground' : ''}`}
                                                >
                                                    <span>{method.icon}</span>
                                                    <span>{method.name}</span>
                                                    {!method.enabled && <span className="text-xs">(Coming Soon)</span>}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                {selectedPaymentMethod === 'mobile_money' && (
                                    <div>
                                        <Label htmlFor="momo-number">Mobile Money Number</Label>
                                        <Input
                                            id="momo-number"
                                            type="tel"
                                            placeholder="07XXXXXXXX"
                                            value={momoNumber}
                                            onChange={(e) => setMomoNumber(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setPaymentDialogOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handlePayment} 
                                    disabled={isProcessing || (selectedPaymentMethod === 'mobile_money' && !momoNumber)}
                                    className="flex-1"
                                >
                                    {isProcessing ? "Processing..." : "Pay Now"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
