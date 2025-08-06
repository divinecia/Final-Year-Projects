
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PendingReview } from "./actions"
import { submitReview } from "./actions"
import { useAuth } from "@/hooks/use-auth"

const formSchema = z.object({
  rating: z.number().min(1, "Please select a rating."),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(500, "Comment cannot exceed 500 characters."),
});

type ReviewFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewData: PendingReview;
  onFormSubmit: () => void;
}

export function ReviewForm({ open, onOpenChange, reviewData, onFormSubmit }: ReviewFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const currentRating = form.watch("rating");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !reviewData) return;
    
    toast({ title: "Submitting Review..." });
    
    const result = await submitReview(
        user.uid, 
        reviewData.jobId, 
        reviewData.workerId, 
        values.rating, 
        values.comment
    );

    if (result.success) {
        toast({
            title: "Success!",
            description: `Your review for ${reviewData.workerName} has been submitted.`,
        });
        onFormSubmit();
        onOpenChange(false);
        form.reset();
    } else {
         toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Could not submit your review.",
        });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Leave a Review for {reviewData.workerName}</DialogTitle>
          <DialogDescription>
            Your feedback helps other households make informed decisions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating</FormLabel>
                  <FormControl>
                    <div 
                      className="flex items-center gap-2"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-8 w-8 cursor-pointer transition-colors",
                            (hoverRating || currentRating) >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground"
                          )}
                          onClick={() => field.onChange(star)}
                          onMouseEnter={() => setHoverRating(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={`Share your experience with ${reviewData.workerName}. What did they do well?`} 
                      rows={5} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
