"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JobAssignment {
  id: string
  jobTitle: string
  householdName: string
  householdAddress: string
  scheduledTime: string
  status: 'assigned' | 'on_way' | 'arrived' | 'in_progress' | 'completed'
}

interface ArrivalConfirmationProps {
  assignment: JobAssignment | null
  onConfirmArrival: (jobId: string) => void
  onUpdateETA: (jobId: string, eta: string) => void
}

export function ArrivalConfirmation({ 
  assignment, 
  onConfirmArrival, 
  onUpdateETA 
}: ArrivalConfirmationProps) {
  const { toast } = useToast()
  const [isConfirming, setIsConfirming] = React.useState(false)

  if (!assignment) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 mb-4" />
          <p>No upcoming assignments</p>
        </CardContent>
      </Card>
    )
  }

  const handleConfirmArrival = async () => {
    setIsConfirming(true)
    try {
      await onConfirmArrival(assignment.id)
      toast({
        title: "Arrival Confirmed",
        description: "The household has been notified of your arrival."
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm arrival. Please try again."
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleUpdateETA = (minutes: number) => {
    const newETA = new Date(Date.now() + minutes * 60000).toISOString()
    onUpdateETA(assignment.id, newETA)
    toast({
      title: "ETA Updated",
      description: `Household notified you&apos;ll arrive in ${minutes} minutes.`
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="secondary">Assigned</Badge>
      case 'on_way':
        return <Badge className="bg-blue-100 text-blue-800">On the way</Badge>
      case 'arrived':
        return <Badge className="bg-green-100 text-green-800">Arrived</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In progress</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Current Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{assignment.jobTitle}</p>
            <p className="text-sm text-muted-foreground">{assignment.householdName}</p>
          </div>
          {getStatusBadge(assignment.status)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{assignment.householdAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Scheduled: {new Date(assignment.scheduledTime).toLocaleTimeString()}</span>
          </div>
        </div>

        {assignment.status === 'assigned' && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Update your ETA:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdateETA(15)}
              >
                15 min
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdateETA(30)}
              >
                30 min
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdateETA(60)}
              >
                1 hour
              </Button>
            </div>
          </div>
        )}

        {(assignment.status === 'assigned' || assignment.status === 'on_way') && (
          <Button 
            className="w-full" 
            onClick={handleConfirmArrival}
            disabled={isConfirming}
          >
            {isConfirming ? (
              "Confirming..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Arrival
              </>
            )}
          </Button>
        )}

        {assignment.status === 'arrived' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              You have confirmed your arrival. You can now start the job.
            </span>
          </div>
        )}

        {assignment.status === 'in_progress' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Job is in progress. Don&apos;t forget to mark as completed when finished.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}