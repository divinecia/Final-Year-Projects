
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "../form-provider";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Step3Schema = z.object({
  availableDays: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one day.",
  }),
  preferredHours: z.string().min(1, "Preferred hours are required."),
  flexibility: z.enum(["full-time", "part-time"], { required_error: "Please select a flexibility option." }),
  oneTimeJobs: z.boolean().default(false),
  recurringJobs: z.boolean().default(false),
  emergencyServices: z.boolean().default(false),
  travelDistance: z.array(z.number()).default([5]),
  hourlyRate: z.array(z.number()).default([500, 1000]),
});

export default function WorkerRegisterStep3Page() {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();

  const form = useForm<z.infer<typeof Step3Schema>>({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      ...formData,
      availableDays: formData.availableDays || [],
      preferredHours: formData.preferredHours || "9am - 5pm",
      flexibility: formData.flexibility || "full-time",
      oneTimeJobs: formData.oneTimeJobs ?? true,
      recurringJobs: formData.recurringJobs ?? false,
      emergencyServices: formData.emergencyServices ?? false,
      travelDistance: formData.travelDistance || [5],
      hourlyRate: formData.hourlyRate || [500, 1000]
    },
  });

  function onSubmit(values: z.infer<typeof Step3Schema>) {
    setFormData((prev) => ({ ...prev, ...values }));
    router.push("/worker/register/step-4");
  }

  return (
    <>
      <Progress value={75} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Availability</CardTitle>
          <CardDescription>Step 3: When can you work?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField
                control={form.control}
                name="availableDays"
                render={() => (
                  <FormItem>
                    <FormLabel>Available Days</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {DAYS.map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="availableDays"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), day])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== day)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{day}</FormLabel>
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
                name="preferredHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Hours (e.g., 9am - 5pm)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9am - 5pm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flexibility"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Flexibility</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="full-time" />
                          </FormControl>
                          <FormLabel className="font-normal">Full-time</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="part-time" />
                          </FormControl>
                          <FormLabel className="font-normal">Part-time</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Service Preferences</FormLabel>
                <div className="flex flex-col space-y-2">
                    <FormField
                        control={form.control}
                        name="oneTimeJobs"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>One-time Jobs</FormLabel>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="recurringJobs"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Recurring Jobs</FormLabel>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="emergencyServices"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Emergency Services</FormLabel>
                            <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                </div>
              </div>


              <FormField
                control={form.control}
                name="travelDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Travel Distance (km): {field.value?.[0] || 0} km</FormLabel>
                    <FormControl>
                       <Slider
                        min={0}
                        max={50}
                        step={1}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate Range (RWF): {field.value?.[0]} - {field.value?.[1]}</FormLabel>
                    <FormControl>
                       <Slider
                        min={500}
                        max={5000}
                        step={100}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
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
