"use client"

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { type Worker } from "@/app/household/find-worker/actions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Extend Worker type to include available, verified, bio
type WorkerExt = Worker & {
  available?: boolean;
  verified?: boolean;
  bio?: string;
};

interface ServiceWorkersListProps {
  workers: WorkerExt[];
}

export default function ServiceWorkersList({ workers }: ServiceWorkersListProps) {
  const [sort, setSort] = React.useState("newest");

  // Sorting logic
  const sortedWorkers = [...workers].sort((a, b) => {
    if (sort === "price_asc") return (a.hourlyRate || 0) - (b.hourlyRate || 0);
    if (sort === "price_desc") return (b.hourlyRate || 0) - (a.hourlyRate || 0);
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    // Default: newest (no sorting, keep as is)
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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
        {sortedWorkers.length > 0 ? (
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
