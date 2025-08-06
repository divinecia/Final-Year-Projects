
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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "../form-provider";

const SERVICES = [
  { id: "house_cleaning", label: "House Cleaning" },
  { id: "cooking", label: "Cooking" },
  { id: "childcare", label: "Childcare" },
  { id: "elderly_care", label: "Elderly Care" },
  { id: "gardening", label: "Gardening" },
  { id: "laundry_ironing", label: "Laundry & Ironing" },
  { id: "general_housework", label: "General Housework" },
];

const LANGUAGES = [
    { id: "kinyarwanda", label: "Kinyarwanda" },
    { id: "english", label: "English" },
    { id: "french", label: "French" },
    { id: "swahili", label: "Swahili" },
]

const Step2Schema = z.object({
  experience: z.array(z.number()).default([0]),
  previousEmployers: z.string().optional(),
  description: z.string().optional(),
  services: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one service.",
  }),
  certificates: z.any().optional(),
  languages: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one language.",
  }),
});

export default function WorkerRegisterStep2Page() {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();

  const form = useForm<z.infer<typeof Step2Schema>>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
        ...formData,
        experience: formData.experience || [5],
        previousEmployers: formData.previousEmployers || "",
        description: formData.description || "",
        services: formData.services || [],
        languages: formData.languages || [],
    },
  });

  function onSubmit(values: z.infer<typeof Step2Schema>) {
    setFormData((prev) => ({ ...prev, ...values }));
    router.push("/worker/register/step-3");
  }

  return (
    <>
      <Progress value={50} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Step 2: Tell us about your skills</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience: {field.value?.[0] || 0} years</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={20}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Description of your Experience</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your past roles and responsibilities" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <FormLabel>Service Categories</FormLabel>
                    <div className="space-y-2">
                        {SERVICES.map((service) => (
                        <FormField
                            key={service.id}
                            control={form.control}
                            name="services"
                            render={({ field }) => {
                            return (
                                <FormItem
                                key={service.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(service.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), service.id])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== service.id
                                            )
                                            );
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    {service.label}
                                </FormLabel>
                                </FormItem>
                            );
                            }}
                        />
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="languages"
                render={() => (
                  <FormItem>
                    <FormLabel>Languages Spoken</FormLabel>
                    <div className="space-y-2">
                        {LANGUAGES.map((lang) => (
                        <FormField
                            key={lang.id}
                            control={form.control}
                            name="languages"
                            render={({ field }) => {
                            return (
                                <FormItem
                                key={lang.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(lang.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), lang.id])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== lang.id
                                            )
                                            );
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    {lang.label}
                                </FormLabel>
                                </FormItem>
                            );
                            }}
                        />
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="certificates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills & Certifications (Optional)</FormLabel>
                    <FormControl>
                      <Input type="file" multiple onChange={(e) => field.onChange(e.target.files)} />
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
