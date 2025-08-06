"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { rescheduleBooking } from "./actions"

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  currentDate: string
  currentTime: string
  onSuccess?: () => void
}

export function RescheduleDialog({
  open,
  onOpenChange,
  bookingId,
  currentDate,
  currentTime,
  onSuccess
}: RescheduleDialogProps) {
  const [date, setDate] = React.useState<Date>()
  const [time, setTime] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setDate(undefined)
      setTime("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !time) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both date and time."
      })
      return
    }

    setLoading(true)
    
    try {
      const formattedDate = format(date, "MMMM d, yyyy")
      const result = await rescheduleBooking(bookingId, formattedDate, time)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Reschedule request sent successfully"
        })
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to reschedule booking"
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to reschedule booking. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Current booking: {currentDate} at {currentTime}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">New Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">New Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Rescheduling..." : "Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
