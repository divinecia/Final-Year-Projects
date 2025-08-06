
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getWorkerReviews, type ReviewSummary } from "./actions"

const StarRating = ({ rating, className }: { rating: number, className?: string }) => (
    <div className={cn("flex items-center gap-0.5", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
        ))}
    </div>
)

const PublishedReviewCard = ({ review }: { review: ReviewSummary['reviews'][0] }) => (
    <Card>
        <CardHeader className="flex flex-row items-start gap-4">
             <Avatar className="h-12 w-12">
                <AvatarImage src={review.householdProfilePictureUrl} data-ai-hint="person portrait"/>
                <AvatarFallback>{review.householdName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.householdName}</p>
                    <p className="text-sm text-muted-foreground">{review.reviewDate}</p>
                </div>
                <StarRating rating={review.rating} />
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>
        </CardContent>
    </Card>
)

const PublishedReviewSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-start gap-4">
             <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-24" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </CardContent>
    </Card>
)

export default function WorkerReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [summary, setSummary] = React.useState<ReviewSummary | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchReviews = async () => {
            if (user) {
                setLoading(true);
                try {
                    const data = await getWorkerReviews(user.uid);
                    setSummary(data);
                } catch {
                    toast({ variant: "destructive", title: "Error", description: "Could not fetch your reviews." });
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!authLoading) {
            fetchReviews();
        }
    }, [user, authLoading, toast]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
                <p className="text-muted-foreground">See what households are saying about your work.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Overall Rating</CardTitle>
                    {loading ? (
                         <>
                            <Skeleton className="h-8 w-28 mt-2" />
                            <Skeleton className="h-4 w-32" />
                         </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-3xl font-bold">{summary?.averageRating.toFixed(1) ?? "N/A"}</p>
                                <StarRating rating={summary?.averageRating ?? 0} className="[&>svg]:h-6 [&>svg]:w-6" />
                            </div>
                            <p className="text-sm text-muted-foreground">Based on {summary?.reviewsCount ?? 0} review(s)</p>
                        </>
                    )}
                </CardHeader>
            </Card>

            <div className="space-y-4">
                 <h2 className="text-2xl font-semibold tracking-tight">All Reviews</h2>
                 {loading ? (
                    <>
                        <PublishedReviewSkeleton />
                        <PublishedReviewSkeleton />
                        <PublishedReviewSkeleton />
                    </>
                 ) : summary && summary.reviews.length > 0 ? (
                    summary.reviews.map((review) => <PublishedReviewCard key={review.id} review={review} />)
                 ) : (
                    <p className="text-center text-muted-foreground py-8">You have not received any reviews yet.</p>
                 )}
            </div>
        </div>
    )
}
