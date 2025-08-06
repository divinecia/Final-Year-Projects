"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Phone, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ETAInfo {
  workerId: string
  workerName: string
  workerPhone: string
  workerProfilePicture?: string
  estimatedArrival: string
  currentLocation?: string
  status: 'on_way' | 'arrived' | 'delayed'
  lastUpdated: string
}

interface ETATrackerProps {
  etaInfo: ETAInfo | null
  onCallWorker: () => void
  onMessageWorker: () => void
}

export function ETATracker({ etaInfo, onCallWorker, onMessageWorker }: ETATrackerProps) {
  if (!etaInfo) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 mb-4" />
          <p>No worker assigned yet</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_way':
        return <Badge className="bg-blue-100 text-blue-800">On the way</Badge>
      case 'arrived':
        return <Badge className="bg-green-100 text-green-800">Arrived</Badge>
      case 'delayed':
        return <Badge variant="destructive">Delayed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const eta = new Date(etaInfo.estimatedArrival)
    const diff = eta.getTime() - now.getTime()
    
    if (diff <= 0) {
      return "Should have arrived"
    }
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`
    }
    return `${minutes}m remaining`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Worker ETA Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={etaInfo.workerProfilePicture} />
            <AvatarFallback>{etaInfo.workerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{etaInfo.workerName}</p>
            <p className="text-sm text-muted-foreground">{etaInfo.workerPhone}</p>
          </div>
          {getStatusBadge(etaInfo.status)}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>ETA: {new Date(etaInfo.estimatedArrival).toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{etaInfo.currentLocation || "Location not shared"}</span>
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="font-medium text-lg">{getTimeRemaining()}</p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(etaInfo.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCallWorker}>
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
          <Button variant="outline" className="flex-1" onClick={onMessageWorker}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>

        {etaInfo.status === 'delayed' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              The worker is running late. They will contact you with an updated arrival time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}