
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowRight, Star, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { services } from "@/lib/services"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getTopRatedWorkers, getUpcomingBooking } from "./actions"
import type { Worker } from "../find-worker/actions";
import type { Booking } from "../bookings/actions";
import { cn } from "@/lib/utils";

const WorkerCard = ({ worker }: { worker: Worker }) => {
    // const getSkillLabel = (skillId: string) => {
    //     return services.find(s => s.id === skillId)?.name || skillId;
    // }

    return (
         <Card className="flex flex-col h-full">
            <CardContent className="p-4 flex flex-col items-center text-center flex-grow">
                <Avatar className="w-16 h-16 mb-4">
                    <AvatarImage src={worker.profilePictureUrl} data-ai-hint="portrait" />
                    <AvatarFallback>{worker.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{worker.fullName}</p>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Star className={cn("h-4 w-4", worker.rating > 0 ? "text-yellow-400 fill-yellow-400" : "")} />
                    <span>{worker.rating.toFixed(1)} ({worker.reviewsCount})</span>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" asChild>
                    <Link href={`/household/worker-profile/${worker.id}`}>View Profile</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

const WorkerCardSkeleton = () => (
    <Card>
        <CardContent className="p-4 flex flex-col items-center text-center">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-16 mb-3" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
)

export default function HouseholdDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [topWorkers, setTopWorkers] = React.useState<Worker[]>([]);
    const [upcomingBooking, setUpcomingBooking] = React.useState<Booking | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                try {
                    const [workersData, bookingData] = await Promise.all([
                        getTopRatedWorkers(),
                        getUpcomingBooking(user.uid),
                    ]);
                    setTopWorkers(workersData);
                    setUpcomingBooking(bookingData);
                } catch {
                     toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Could not load dashboard data."
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


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to your Home Hub!</h1>
        <p className="text-muted-foreground">Easily manage your home, book services, and find trusted help.</p>
      </div>

      <Card className="bg-primary/10 border-primary/20">
        <div className="flex flex-col items-center justify-between p-6 gap-4 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary">Get 15% Off Your First Booking!</h2>
            <p className="text-primary/80 mt-1">
              Use code <span className="font-semibold">WELCOME15</span> to get a discount on any service. Find the perfect help for your home today.
            </p>
          </div>
          <Button size="lg" asChild className="mt-4 md:mt-0 flex-shrink-0">
            <Link href="/household/find-worker">
                Book a Professional <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Our Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {services.map((service) => (
            <Link href={`/household/services/${service.id}`} key={service.id}>
              <Card className="text-center h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                  <div className="h-8 w-8 text-primary">
                    {React.isValidElement(service.icon)
                      ? service.icon
                      : typeof service.icon === "function"
                        ? React.createElement(service.icon)
                        : null}
                  </div>
                  <p className="font-semibold text-sm">{service.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Top Rated Professionals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <>
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
             </>
          ) : (
            topWorkers.map(worker => <WorkerCard key={worker.id} worker={worker} />)
          )}
        </div>
      </div>
      
       <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Upcoming Booking</span>
            </CardTitle>
             <CardDescription>Your next scheduled service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             {loading ? (
                 <>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                            <Skeleton className="h-5 w-40 mb-1" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                 </>
             ) : upcomingBooking ? (
                 <>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={upcomingBooking.workerProfilePictureUrl} />
                            <AvatarFallback>{upcomingBooking.workerName?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{upcomingBooking.jobTitle}</p>
                            <p className="text-sm text-muted-foreground">with {upcomingBooking.workerName}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{upcomingBooking.jobDate}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{upcomingBooking.jobTime}</span>
                        </div>
                    </div>
                 </>
             ) : (
                <p className="text-center text-muted-foreground py-8">No upcoming bookings.</p>
             )}
          </CardContent>
           <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/household/bookings">Manage Bookings</Link>
                </Button>
            </CardFooter>
        </Card>

    </div>
  )
}

export const dynamic = 'force-dynamic';
