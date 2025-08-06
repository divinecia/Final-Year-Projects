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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  bookingId: z.string({ required_error: "Please select the relevant booking." }),
  issueType: z.enum(["system", "worker", "maintenance"], { required_error: "Please select the type of issue." }),
  urgency: z.string({ required_error: "Please select an urgency level." }),
  description: z.string().min(20, "Please provide a detailed description of at least 20 characters."),
  sendToIsange: z.boolean().default(false),
  contactInfo: z.string().optional(),
});

type ReportIssueFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportIssueForm({ open, onOpenChange }: ReportIssueFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  const issueType = form.watch("issueType");

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    if (values.issueType === 'system') {
        toast({
          title: "System Report Submitted",
          description: "Our technical team has been notified and will investigate the issue.",
        });
    } else {
        toast({
            title: "Worker Report Logged",
            description: "Your report has been received. For emergencies, please contact the authorities directly.",
            variant: "destructive"
        });
    }
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Your report will be handled with confidentiality and urgency.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bookingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant Booking/Worker</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a past service" /></SelectTrigger></FormControl>
                      <SelectContent>
                          <SelectItem value="booking_1">Alice Uwera - Deep Cleaning - July 15, 2024</SelectItem>
                          <SelectItem value="booking_2">John Doe - Gardening - July 12, 2024</SelectItem>
                          <SelectItem value="booking_3">Other/General Issue</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type of Issue</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="system" /></FormControl>
                        <FormLabel className="font-normal">System Problem (e.g., bug, payment error)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="maintenance" /></FormControl>
                        <FormLabel className="font-normal">System Maintenance Request</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="worker" /></FormControl>
                        <FormLabel className="font-normal">Worker Behavior / Safety Concern</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {issueType === 'worker' && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Safety First!</AlertTitle>
                    <AlertDescription>
                        If you are in immediate danger, please contact the authorities directly.
                        <div className="flex items-center gap-4 mt-2">
                           <p><span className="font-semibold">Police:</span> 112</p>
                           <p><span className="font-semibold">Isange One Stop:</span> 3020</p>
                        </div>
                    </AlertDescription>
                  </Alert>
                  
                  <FormField
                    control={form.control}
                    name="sendToIsange"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                            }} 
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Send copy to ISANGE One Stop Center
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            For serious safety concerns, we can forward your report to ISANGE One Stop Center 
                            (info1@kicukiro.gov.rw) for additional support and intervention.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
            )}

             <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select the urgency of the issue" /></SelectTrigger></FormControl>
                      <SelectContent>
                          <SelectItem value="low">Low (General feedback)</SelectItem>
                          <SelectItem value="medium">Medium (Service quality issue)</SelectItem>
                          <SelectItem value="high">High (Requires prompt attention)</SelectItem>
                          {issueType === "worker" && <SelectItem value="emergency" className="text-destructive">Emergency (Safety concern)</SelectItem>}
                          {issueType === "maintenance" && <SelectItem value="low">Low (General maintenance)</SelectItem>}
                      </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={
                        issueType === 'maintenance' 
                          ? "Describe the system issue or maintenance request in detail..."
                          : "Please provide as much detail as possible, including dates, times, and what happened."
                      }
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
              <Button type="submit">Submit Report</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}