
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from "lucide-react"
import { ReviewForm } from "./review-form"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getPendingReviews, getPublishedReviews, type PendingReview, type PublishedReview } from "./actions"

const StarRating = ({ rating, className }: { rating: number, className?: string }) => (
    <div className={cn("flex items-center gap-0.5", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
        ))}
    </div>
)

const PendingReviewCard = ({ review, onReviewClick }: { review: PendingReview, onReviewClick: (review: PendingReview) => void }) => (
    <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={review.workerProfilePictureUrl} data-ai-hint="person portrait" />
                    <AvatarFallback>{review.workerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{review.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">with {review.workerName} on {review.serviceDate}</p>
                </div>
            </div>
            <Button onClick={() => onReviewClick(review)}>Leave a Review</Button>
        </CardContent>
    </Card>
);

const PublishedReviewCard = ({ review }: { review: PublishedReview }) => (
     <Card>
        <CardHeader className="flex flex-row items-start gap-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src={review.workerProfilePictureUrl} data-ai-hint="person portrait" />
                <AvatarFallback>{review.workerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.workerName}</p>
                    <p className="text-sm text-muted-foreground">{review.reviewDate}</p>
                </div>
                <StarRating rating={review.rating} />
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>
        </CardContent>
    </Card>
);


const PendingReviewSkeleton = () => (
    <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
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


export default function ReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [selectedReview, setSelectedReview] = React.useState<PendingReview | null>(null);
    const [pendingReviews, setPendingReviews] = React.useState<PendingReview[]>([]);
    const [publishedReviews, setPublishedReviews] = React.useState<PublishedReview[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchReviews = React.useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const [pending, published] = await Promise.all([
                    getPendingReviews(user.uid),
                    getPublishedReviews(user.uid)
                ]);
                setPendingReviews(pending);
                setPublishedReviews(published);
            } catch {
                toast({ variant: "destructive", title: "Error", description: "Could not load your reviews." });
            } finally {
                setLoading(false);
            }
        }
    }, [user, toast]);

    React.useEffect(() => {
        if (!authLoading) {
            fetchReviews();
        }
    }, [authLoading, fetchReviews]);

    const handleReviewClick = (review: PendingReview) => {
        setSelectedReview(review);
        setIsFormOpen(true);
    };

    const handleFormSubmit = () => {
        fetchReviews(); // Re-fetch reviews after submission
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
                <p className="text-muted-foreground">Manage your feedback for workers you&apos;ve hired.</p>
            </div>
            
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Reviews</CardTitle>
                        <CardDescription>You have {loading ? <Skeleton className="h-4 w-4 inline-block" /> : pendingReviews.length} pending review(s) to complete.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? <PendingReviewSkeleton /> : (
                            pendingReviews.length > 0 ? (
                                pendingReviews.map(review => (
                                    <PendingReviewCard key={review.jobId} review={review} onReviewClick={handleReviewClick} />
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No pending reviews.</p>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                 <h2 className="text-2xl font-semibold tracking-tight">Your Published Reviews</h2>
                <div className="space-y-4">
                   {loading ? (
                       <>
                           <PublishedReviewSkeleton />
                           <PublishedReviewSkeleton />
                       </>
                   ) : (
                       publishedReviews.length > 0 ? (
                           publishedReviews.map(review => (
                               <PublishedReviewCard key={review.id} review={review} />
                           ))
                       ) : (
                           <p className="text-center text-muted-foreground py-4">You haven&apos;t published any reviews yet.</p>
                       )
                   )}
                </div>
            </div>
            {selectedReview && (
                <ReviewForm 
                    open={isFormOpen} 
                    onOpenChange={setIsFormOpen}
                    reviewData={selectedReview}
                    onFormSubmit={handleFormSubmit}
                />
            )}
        </div>
    )
}
