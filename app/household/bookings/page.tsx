"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Edit, MessageSquare, Star, Trash2, Phone } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getHouseholdBookings, cancelBooking, createReviewBooking, type Booking } from "./actions"
import { serviceOptions } from "@/lib/services"
// import { cn } from "@/lib/utils"
import { RescheduleDialog } from "./reschedule-dialog"

const UpcomingBooking = ({ booking, onBookingUpdate }: { booking: Booking; onBookingUpdate: () => void }) => {
    const { toast } = useToast()
    const [rescheduleOpen, setRescheduleOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    // const getServiceName = (serviceId: string) => {
    //     return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    // }
    
    const getStatusBadge = (status: Booking['status']) => {
        switch (status) {
            case 'open':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Finding Worker</Badge>;
            case 'assigned':
                return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Upcoming</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleCancelBooking = async () => {
        if (!confirm("Are you sure you want to cancel this booking?")) {
            return;
        }

        setLoading(true);
        try {
            const result = await cancelBooking(booking.id);
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message || "Booking cancelled successfully"
                });
                onBookingUpdate();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to cancel booking"
                });
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to cancel booking. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCallWorker = () => {
        if (booking.workerPhone) {
            window.open(`tel:${booking.workerPhone}`, '_self');
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                // error is intentionally unused
                description: "Worker phone number not available."
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={booking.workerProfilePictureUrl} data-ai-hint="woman portrait" />
                        <AvatarFallback>{booking.workerName?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{booking.jobTitle}</p>
                        <p className="text-muted-foreground">with {booking.workerName || "Pending Worker"}</p>
                    </div>
                </div>
                {getStatusBadge(booking.status)}
            </CardHeader>
            <CardContent>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.jobDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{booking.jobTime}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
                <Button asChild><Link href="/household/messaging"><MessageSquare className="mr-2 h-4 w-4"/> Message Worker</Link></Button>
                <Button variant="outline" onClick={handleCallWorker}>
                    <Phone className="mr-2 h-4 w-4"/> Call Worker
                </Button>
                <Button 
                    variant="ghost" 
                    className="text-muted-foreground" 
                    onClick={() => setRescheduleOpen(true)}
                >
                    <Edit className="mr-2 h-4 w-4"/> Reschedule
                </Button>
                <Button 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive" 
                    onClick={handleCancelBooking}
                    disabled={loading}
                >
                    <Trash2 className="mr-2 h-4 w-4"/> 
                    {loading ? "Cancelling..." : "Cancel"}
                </Button>
                
                <RescheduleDialog
                    open={rescheduleOpen}
                    onOpenChange={setRescheduleOpen}
                    bookingId={booking.id}
                    currentDate={booking.jobDate || ""}
                    currentTime={booking.jobTime || ""}
                    onSuccess={onBookingUpdate}
                />
            </CardFooter>
        </Card>
    )
}

const PastBooking = ({ booking, onBookingUpdate }: { booking: Booking; onBookingUpdate: () => void }) => {
    const { toast } = useToast()
    const [loading, setLoading] = React.useState(false)

    const getServiceName = (serviceId: string) => {
        return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    }
    
    const getStatusBadge = (status: Booking['status']) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleBookAgain = async () => {
        setLoading(true);
        try {
            const result = await createReviewBooking(booking);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "New booking created! You can view it in your upcoming bookings."
                });
                onBookingUpdate();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.message || "Failed to create new booking"
                });
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create new booking. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveReview = () => {
        // Navigate to reviews page with booking ID
        window.location.href = `/household/reviews?bookingId=${booking.id}`;
    };

    return (
        <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-4 flex-1">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={booking.workerProfilePictureUrl} data-ai-hint="woman portrait" />
                    <AvatarFallback>{booking.workerName?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <p className="font-semibold">{getServiceName(booking.serviceType)} with {booking.workerName}</p>
                    <p className="text-sm text-muted-foreground">{booking.jobDate}</p>
                    {getStatusBadge(booking.status)}
                </div>
            </div>
            <div className="flex items-center flex-wrap gap-2">
                <Button variant="outline" onClick={handleLeaveReview}>
                    <Star className="mr-2 h-4 w-4"/> Leave a Review
                </Button>
                <Button onClick={handleBookAgain} disabled={loading}>
                    {loading ? "Creating..." : "Book Again"}
                </Button>
            </div>
        </Card>
    )
}


const UpcomingBookingSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-md" />
        </CardHeader>
        <CardContent>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
            </div>
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
        </CardFooter>
    </Card>
);

const PastBookingSkeleton = () => (
     <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1">
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-24" />
            </div>
        </div>
        <div className="flex items-center flex-wrap gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
        </div>
    </Card>
);


export default function BookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [bookings, setBookings] = React.useState<{ upcoming: Booking[]; past: Booking[] }>({ upcoming: [], past: [] });
    const [loading, setLoading] = React.useState(true);

    const fetchBookings = React.useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const fetchedBookings = await getHouseholdBookings(user.uid);
                setBookings(fetchedBookings);
            } catch {
                console.error("Failed to fetch bookings");
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load your bookings."
                });
            } finally {
                setLoading(false);
            }
        }
    }, [user, toast]);

    React.useEffect(() => {
        if (!authLoading) {
            fetchBookings();
        }
    }, [authLoading, fetchBookings]);


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                <p className="text-muted-foreground">View and manage your upcoming and past service bookings.</p>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Upcoming</h2>
                {loading ? (
                    <UpcomingBookingSkeleton />
                ) : bookings.upcoming.length > 0 ? (
                    bookings.upcoming.map(booking => <UpcomingBooking key={booking.id} booking={booking} onBookingUpdate={fetchBookings} />)
                ) : (
                    <Card className="text-center p-12 text-muted-foreground">
                        You have no upcoming bookings.
                    </Card>
                )}
            </div>

            <div className="space-y-6">
                 <h2 className="text-2xl font-semibold tracking-tight">History</h2>
                <div className="space-y-4">
                     {loading ? (
                        <>
                            <PastBookingSkeleton />
                            <PastBookingSkeleton />
                        </>
                    ) : bookings.past.length > 0 ? (
                         bookings.past.map(booking => <PastBooking key={booking.id} booking={booking} onBookingUpdate={fetchBookings} />)
                    ) : (
                        <Card className="text-center p-12 text-muted-foreground">
                            You have no past bookings.
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
