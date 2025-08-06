
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { getActiveWorkers, type Worker } from "@/app/household/find-worker/actions";
import { services } from "@/lib/services";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const WorkerCardSkeleton = () => (
  <Card>
    <CardContent className="p-4 flex flex-col items-center text-center">
      <Skeleton className="w-16 h-16 rounded-full mb-4" />
      <Skeleton className="h-5 w-24 mb-1" />
      <Skeleton className="h-4 w-32 mb-3" />
      <div className="flex flex-wrap justify-center gap-1 mb-3 h-10 items-center">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-16" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

export default function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const [serviceId, setServiceId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    params.then((resolvedParams) => {
      setServiceId(resolvedParams.serviceId);
    });
  }, [params]);
  // Extend Worker type to include available, verified, bio
  type WorkerExt = Worker & {
    available?: boolean;
    verified?: boolean;
    bio?: string;
  };
  const [workers, setWorkers] = React.useState<WorkerExt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sort, setSort] = React.useState("newest");
  const [service, setService] = React.useState<typeof services[0] | null>(null);
  const [serviceLoading, setServiceLoading] = React.useState(true);

  React.useEffect(() => {
    if (!serviceId) return;
    setServiceLoading(true);
    const fetchService = async () => {
      // Find service from our static services array
      const foundService = services.find(s => s.id === serviceId);
      if (foundService) {
        setService(foundService);
      } else {
        setService(null);
      }
      setServiceLoading(false);
    };
    fetchService();
  }, [serviceId]);

  React.useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    getActiveWorkers().then((allWorkers) => {
      // Filter workers by service
      // Cast to WorkerExt for extra fields
      const filtered = allWorkers.filter(w => w.skills.includes(serviceId)) as WorkerExt[];
      setWorkers(filtered);
      setLoading(false);
    });
  }, [serviceId]);

  if (!serviceId || serviceLoading) return <div>Loading...</div>;
  if (!service) notFound();

  // Sorting logic
  const sortedWorkers = [...workers].sort((a, b) => {
    if (sort === "price_asc") return (a.hourlyRate || 0) - (b.hourlyRate || 0);
    if (sort === "price_desc") return (b.hourlyRate || 0) - (a.hourlyRate || 0);
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    // Default: newest (no sorting, keep as is)
    return 0;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-1">Professionals for {service.name}</h1>
          <p className="text-base text-muted-foreground">Browse and book top-rated workers for this service.</p>
        </div>
        <div className="w-full max-w-xs">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="border rounded-lg shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <WorkerCardSkeleton key={i} />)
        ) : sortedWorkers.length > 0 ? (
          sortedWorkers.map((worker: WorkerExt) => (
            <Card key={worker.id} className="rounded-xl border shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4 shadow">
                  <AvatarImage src={worker.profilePictureUrl || undefined} />
                  <AvatarFallback className="text-2xl font-bold bg-muted text-primary">{worker.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 mb-2">
                  {/* Availability status */}
                  <Badge className={`text-xs px-2 py-1 rounded-full ${worker.available ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                    {worker.available ? 'Available' : 'Busy'}
                  </Badge>
                  {/* Verified badge */}
                  {worker.verified && (
                    <Badge className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">Verified</Badge>
                  )}
                </div>
                <p className="font-bold text-xl mb-1 text-primary">{worker.fullName}</p>
                {/* Short bio/tagline */}
                {worker.bio && (
                  <p className="text-sm text-muted-foreground mb-2 italic">{worker.bio}</p>
                )}
                <div className="flex items-center gap-2 text-base text-muted-foreground mb-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{worker.rating.toFixed(1)}</span>
                  <span className="text-xs">({worker.reviewsCount} reviews)</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-3 h-10 items-center">
                  {worker.skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{skill}</Badge>
                  ))}
                </div>
                <div className="font-semibold mb-2 text-lg text-green-700">RWF {worker.hourlyRate || 2500}/hr</div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button asChild className="w-full font-semibold text-base">
                  <Link href={`/household/worker-profile/${worker.id}`}>View Profile</Link>
                </Button>
                <Button asChild variant="outline" className="w-full font-semibold text-base">
                  <Link href={`/household/bookings?workerId=${worker.id}`}>Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="col-span-full text-center p-12 text-muted-foreground bg-gray-50 border-dashed border-2">
            No workers available for this service.
          </Card>
        )}
      </div>
    </div>
  );
}


