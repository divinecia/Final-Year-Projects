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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createTraining, trainingSchema } from "./actions"

type TrainingFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFormSubmit: () => void
}

export function TrainingForm({ open, onOpenChange, onFormSubmit }: TrainingFormProps) {
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof trainingSchema>>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      title: "",
      category: "",
      duration: "",
      description: "",
      status: "active",
    },
  })

  async function onSubmit(values: z.infer<typeof trainingSchema>) {
    toast({
      title: "Creating Training Program...",
      description: "Please wait while we create the training program.",
    })
    
    const result = await createTraining(values)

    if (result.success) {
      toast({
        title: "Success!",
        description: `Training program "${values.title}" has been created.`,
      })
      onFormSubmit()
      onOpenChange(false)
      form.reset()
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not create the training program.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Training Program</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new training program for workers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Professional Cleaning Techniques" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cleaning">Cleaning & Maintenance</SelectItem>
                        <SelectItem value="childcare">Childcare & Safety</SelectItem>
                        <SelectItem value="cooking">Cooking & Nutrition</SelectItem>
                        <SelectItem value="eldercare">Elder Care</SelectItem>
                        <SelectItem value="safety">Safety & First Aid</SelectItem>
                        <SelectItem value="communication">Communication Skills</SelectItem>
                        <SelectItem value="technology">Technology & Apps</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 hours, 1 day, 1 week" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this training covers and what workers will learn." 
                      rows={4} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Training Program"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}