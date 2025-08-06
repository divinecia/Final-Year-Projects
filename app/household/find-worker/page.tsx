"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, MapPin, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getActiveWorkers, type Worker } from "./actions"
import Link from "next/link"

const WorkerCard = ({ worker }: { worker: Worker }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        {worker.profilePictureUrl ? (
                            <Image 
                                src={worker.profilePictureUrl} 
                                alt={worker.fullName} 
                                width={48}
                                height={48}
                                className="w-full h-full rounded-full object-cover" 
                            />
                        ) : (
                            <span className="text-lg font-semibold">{worker.fullName.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <CardTitle className="text-lg">{worker.fullName}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>Available in Kigali</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold">RWF {worker.hourlyRate || 2500}/hr</div>
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{worker.rating} ({worker.reviewsCount})</span>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                    </Badge>
                ))}
            </div>
            <Button className="w-full" asChild>
                <Link href={`/household/worker-profile/${worker.id}`}>Contact Worker</Link>
            </Button>
        </CardContent>
    </Card>
);

const WorkerCardSkeleton = () => (
    <Card>
        <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
            </div>
            <Skeleton className="h-10 w-full" />
        </CardContent>
    </Card>
);

export default function FindWorkerPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const fetchWorkers = async () => {
            setLoading(true);
            try {
                // Fetch real workers from the database
                const activeWorkers = await getActiveWorkers();
                setWorkers(activeWorkers);
            } catch {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch workers."
                });
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, [toast]);

    const filteredWorkers = workers.filter(worker =>
        worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Find a Worker</h1>
                <p className="text-muted-foreground">Browse and connect with qualified household workers in your area.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <WorkerCardSkeleton key={i} />)
                ) : filteredWorkers.length > 0 ? (
                    filteredWorkers.map(worker => <WorkerCard key={worker.id} worker={worker} />)
                ) : (
                    <p className="text-center col-span-full py-10 text-muted-foreground">
                        {searchQuery ? 'No workers found matching your search.' : 'No workers available at the moment.'}
                    </p>
                )}
            </div>
        </div>
    )
}

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';
