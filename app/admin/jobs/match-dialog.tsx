"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { matchWorkersToJob, type MatchResult } from "@/ai/flows/match-worker-flow"
import type { Job } from "./actions"
import { assignWorkerToJob } from "./actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type MatchDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    job: Job
    onJobAssigned: () => void
}

const MatchSkeleton = () => (
    <div className="flex items-center gap-4 py-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-10 w-24" />
    </div>
)

export function MatchDialog({
    open,
    onOpenChange,
    job,
    onJobAssigned,
}: MatchDialogProps) {
    const { toast } = useToast()
    const [matches, setMatches] = React.useState<MatchResult[]>([])
    const [loading, setLoading] = React.useState(false)
    const [assigningId, setAssigningId] = React.useState<string | null>(null)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (open && job) {
            const getMatches = async () => {
                setLoading(true)
                setMatches([])
                setError(null)
                try {
                    const results = await matchWorkersToJob({ jobId: job.id })
                    setMatches(results)
                } catch {
                    setError("Could not get worker recommendations. Please try again later.")
                    toast({
                        variant: "destructive",
                        title: "AI Matching Failed",
                        description: "Could not get worker recommendations. Please try again later.",
                    })
                } finally {
                    setLoading(false)
                }
            }
            getMatches()
        }
    }, [open, job, toast])

    const handleAssign = React.useCallback(
        async (workerId: string, workerName: string) => {
            setAssigningId(workerId)
            const result = await assignWorkerToJob(job.id, workerId, workerName)
            setAssigningId(null)
            if (result.success) {
                toast({
                    title: "Worker Assigned!",
                    description: `${workerName} has been assigned to the job "${job.jobTitle}".`,
                })
                onJobAssigned()
                onOpenChange(false)
            } else {
                toast({
                    variant: "destructive",
                    title: "Assignment Failed",
                    description: result.error,
                })
            }
        },
        [job, onJobAssigned, onOpenChange, toast]
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>AI Smart Match Results</DialogTitle>
                    <DialogDescription>
                        Top worker recommendations for the job: &ldquo;{job.jobTitle}&rdquo;
                    </DialogDescription>
                </DialogHeader>
                <div
                    className="space-y-4 max-h-[60vh] overflow-y-auto pr-4"
                    aria-live="polite"
                >
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <MatchSkeleton key={i} />)
                    ) : error ? (
                        <p className="text-center text-destructive py-8">{error}</p>
                    ) : matches.length > 0 ? (
                        matches.map(({ workerId, profilePictureUrl, workerName, score, justification }) => (
                            <div
                                key={workerId}
                                className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted"
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={
                                            profilePictureUrl ||
                                            `https://placehold.co/100x100.png`
                                        }
                                    />
                                    <AvatarFallback>
                                        {workerName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{workerName}</p>
                                        <Badge
                                            variant={score > 80 ? "default" : "secondary"}
                                            className={score > 80 ? "bg-green-500" : ""}
                                        >
                                            Score: {score}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {justification}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleAssign(workerId, workerName)}
                                    disabled={!!assigningId}
                                >
                                    {assigningId === workerId ? (
                                        <span className="animate-spin mr-2">⏳</span>
                                    ) : null}
                                    Assign
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No suitable active workers found.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
