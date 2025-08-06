"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "../form-provider";

const SERVICES = [
  { id: "house_cleaning", label: "House Cleaning" },
  { id: "cooking", label: "Cooking" },
  { id: "childcare", label: "Childcare" },
  { id: "elderly_care", label: "Elderly Care" },
  { id: "gardening", label: "Gardening" },
  { id: "laundry_ironing", label: "Laundry & Ironing" },
];

const Step2Schema = z.object({
  numAdults: z.coerce.number().min(1),
  numChildren: z.coerce.number().min(0).default(0),
  hasPets: z.boolean().default(false),
  petInfo: z.string().optional(),
  primaryServices: z.array(z.string()).refine((val) => val.length > 0, { message: "Select at least one service."}),
  serviceFrequency: z.string().min(1, "Frequency is required."),
});

export default function HouseholdRegisterStep2Page() {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();
  
  const form = useForm<z.infer<typeof Step2Schema>>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      ...formData,
      numAdults: formData.numAdults || 1,
      numChildren: formData.numChildren || 0,
      hasPets: formData.hasPets || false,
      primaryServices: formData.primaryServices || [],
      serviceFrequency: formData.serviceFrequency || "One-time"
    },
  });
  
  const hasPets = form.watch("hasPets");

  function onSubmit(values: z.infer<typeof Step2Schema>) {
    setFormData((prev: Record<string, unknown>) => ({ ...prev, ...values }));
    router.push("/household/register/step-3");
  }

  return (
    <>
      <Progress value={66} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Tell us about your family</CardTitle>
          <CardDescription>Step 2: Help us understand your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <h3 className="font-semibold text-md">Family Composition</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="numAdults"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Number of Adults</FormLabel>
                        <FormControl><Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="numChildren"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Number of Children</FormLabel>
                        <FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              <FormField
                control={form.control}
                name="hasPets"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Do you have pets?</FormLabel>
                    </FormItem>
                )}
                />
              {hasPets && (
                 <FormField
                    control={form.control}
                    name="petInfo"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pet Information</FormLabel>
                        <FormControl><Input placeholder="e.g., 1 dog, 2 cats" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}

              <Separator />
              <h3 className="font-semibold text-md">Service Requirements</h3>

               <FormField
                control={form.control}
                name="primaryServices"
                render={() => (
                  <FormItem>
                    <FormLabel>Primary Services Needed</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICES.map((service) => (
                        <FormField
                          key={service.id}
                          control={form.control}
                          name="primaryServices"
                          render={({ field }) => (
                            <FormItem key={service.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(service.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), service.id])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== service.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{service.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Frequency</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="One-time">One-time</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Back</Button>
                <Button type="submit">Next</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
