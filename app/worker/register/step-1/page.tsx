"use client";

import * as React from "react";
import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2 } from "lucide-react";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "../form-provider";
import { OAuthButtons } from "@/components/oauth-buttons";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const Step1Schema = z.object({
  profilePicture: z.any()
    .refine((file) => file, "Profile picture is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender."
  }),
  nationalId: z.string().regex(/^\d{16}$/, "Please enter a valid 16-digit national ID."),
  district: z.string({ required_error: "Please select a district." }),
  sector: z.string({ required_error: "Please select a sector." }),
  address: z.string().min(5, "Please enter a detailed address."),
  emergencyContactName: z.string().min(2, "Contact name is required."),
  emergencyContactPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  emergencyContactRelationship: z.string().min(2, "Relationship is required."),
});

export default function WorkerRegisterStep1Page() {
  const router = useRouter();
  const { formData, setFormData } = useFormContext();
  const [preview, setPreview] = React.useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
        ...formData,
        fullName: formData.fullName || "",
        phone: formData.phone || "",
        email: formData.email || "",
        nationalId: formData.nationalId || "",
        district: formData.district || undefined,
        sector: formData.sector || undefined,
        address: formData.address || "",
        emergencyContactName: formData.emergencyContactName || "",
        emergencyContactPhone: formData.emergencyContactPhone || "",
        emergencyContactRelationship: formData.emergencyContactRelationship || "",
    },
  });

  function onSubmit(values: z.infer<typeof Step1Schema>) {
    setFormData((prev) => ({ ...prev, ...values }));
    router.push("/worker/register/step-2");
  }

  const profilePictureRef = form.register("profilePicture");

  return (
    <>
      <Progress value={25} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Join as a Professional Worker</CardTitle>
          <CardDescription>Step 1: Basic Information</CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth registration options */}
          <div className="mb-6">
            <p className="text-center text-sm mb-2">Register with:</p>
            <div className="flex justify-center gap-4">
              <OAuthButtons
                onSuccess={(uid, email) => {
                  setFormData((prev) => ({ ...prev, email }));
                  router.push("/worker/register/step-2");
                }}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground mt-2">or fill out the form below</div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-center mb-4">
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div>
                          <label htmlFor="profile-picture-upload" className="cursor-pointer">
                            <Avatar className="w-24 h-24 border-2 border-dashed">
                              <AvatarImage src={preview} alt="Profile picture" />
                              <AvatarFallback>
                                <User2 className="w-10 h-10 text-gray-400" />
                              </AvatarFallback>
                            </Avatar>
                          </label>
                          <Input
                            id="profile-picture-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            {...profilePictureRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    field.onChange(file);
                                    setPreview(URL.createObjectURL(file));
                                }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 078xxxxxxx" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <EnhancedDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select your birth date"
                        minYear={1950}
                        maxYear={2007}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your 16-digit ID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 pt-4">
                <h3 className="font-semibold text-md">Address Information</h3>
              </div>

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your district" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="gasabo">Gasabo</SelectItem>
                            <SelectItem value="kicukiro">Kicukiro</SelectItem>
                            <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!form.watch("district")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("district") === "gasabo" && (
                            <>
                              <SelectItem value="kimihurura">Kimihurura</SelectItem>
                              <SelectItem value="kacyiru">Kacyiru</SelectItem>
                              <SelectItem value="remera">Remera</SelectItem>
                            </>
                          )}
                          {form.watch("district") === "kicukiro" && (
                            <>
                              <SelectItem value="kagarama">Kagarama</SelectItem>
                              <SelectItem value="kanombe">Kanombe</SelectItem>
                              <SelectItem value="gatenga">Gatenga</SelectItem>
                            </>
                          )}
                          {form.watch("district") === "nyarugenge" && (
                            <>
                              <SelectItem value="kimisagara">Kimisagara</SelectItem>
                              <SelectItem value="nyamirambo">Nyamirambo</SelectItem>
                              <SelectItem value="nyakabanda">Nyakabanda</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Current Address</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Please provide your current street and house number."
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2 pt-4">
                    <h3 className="font-semibold text-md">Emergency Contact</h3>
                </div>

                <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. 07xxxxxxx" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="emergencyContactRelationship"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. Sister, Friend" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

              <Button type="submit" className="w-full">
                Next
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/worker/login" className="font-semibold text-primary hover:underline">
          Login here
        </Link>
      </div>
    </>
  );
}
