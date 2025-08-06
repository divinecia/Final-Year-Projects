"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, Send, BookOpen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { 
  getAvailableTrainings, 
  getWorkerTrainingRequests, 
  requestTraining,
  type TrainingProgram,
  type TrainingRequest 
} from "./actions"

const TrainingCard = ({ 
  training, 
  onRequestTraining, 
  hasRequested 
}: { 
  training: TrainingProgram; 
  onRequestTraining: (training: TrainingProgram) => void;
  hasRequested: boolean;
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{training.title}</CardTitle>
        <CardDescription>
          <Badge variant="secondary">{training.category}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground">{training.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Duration: {training.duration}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onRequestTraining(training)}
          disabled={hasRequested}
        >
          {hasRequested ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Request Sent
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Request Training
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

const TrainingCardSkeleton = () => (
  <Card className="flex flex-col">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-1" />
    </CardHeader>
    <CardContent className="flex-grow space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-5 w-24" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
)

function WorkerTrainingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [trainings, setTrainings] = useState<TrainingProgram[]>([])
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTraining, setSelectedTraining] = useState<TrainingProgram | null>(null)
  const [requestMessage, setRequestMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [trainingsData, requestsData] = await Promise.all([
        getAvailableTrainings(),
        getWorkerTrainingRequests(user.uid)
      ])
      setTrainings(trainingsData)
      setTrainingRequests(requestsData)
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch training data."
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    fetchData()
  }, [user, fetchData])

  const handleRequestTraining = (training: TrainingProgram) => {
    setSelectedTraining(training)
    setIsDialogOpen(true)
  }

  const handleSubmitRequest = async () => {
    if (!user || !selectedTraining) return
    
    setSubmitting(true)
    try {
      const result = await requestTraining(
        user.uid,
        user.displayName || 'Worker',
        user.email || '',
        selectedTraining.id,
        requestMessage
      )
      
      if (result.success) {
        toast({
          title: "Request Submitted",
          description: "Your training request has been submitted for review."
        })
        setIsDialogOpen(false)
        setRequestMessage("")
        setSelectedTraining(null)
        fetchData()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to submit training request."
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit training request."
      })
    } finally {
      setSubmitting(false)
    }
  }

  const hasRequestedTraining = (trainingId: string) => {
    return trainingRequests.some(request => request.trainingId === trainingId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training & Development</h1>
        <p className="text-muted-foreground">Invest in your skills and grow your career.</p>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Training</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <TrainingCardSkeleton key={i} />)
            ) : trainings.length > 0 ? (
              trainings.map(training => (
                <TrainingCard 
                  key={training.id} 
                  training={training} 
                  onRequestTraining={handleRequestTraining}
                  hasRequested={hasRequestedTraining(training.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4" />
                <p>No training programs available at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>My Training Requests</CardTitle>
              <CardDescription>Track the status of your training requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {trainingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven&apos;t requested any training yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training Program</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.trainingTitle}</TableCell>
                        <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.approvedAt && new Date(request.approvedAt).toLocaleDateString()}
                          {request.rejectedAt && new Date(request.rejectedAt).toLocaleDateString()}
                          {!request.approvedAt && !request.rejectedAt && '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Training: {selectedTraining?.title}</DialogTitle>
            <DialogDescription>
              Submit a request to join this training program. Your request will be reviewed by the admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell us why you want to join this training..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WorkerTrainingPage

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic'
