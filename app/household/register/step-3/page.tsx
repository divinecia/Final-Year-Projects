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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useFormContext } from "../form-provider";
import { saveHouseholdProfile, type FullFormData } from "../actions";
import { signUpWithEmailAndPassword } from "@/lib/client-auth";
import { OAuthButtons } from "@/components/oauth-buttons";

const Step3Schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
  consent: z.boolean().refine(value => value, { message: "You must agree to the terms." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function HouseholdRegisterStep3Page() {
  const router = useRouter();
  const { toast } = useToast();
  const { formData } = useFormContext();

  const form = useForm<z.infer<typeof Step3Schema>>({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      consent: false,
    },
  });

  // Handle OAuth sign-in success
  async function handleOAuthSuccess(userId: string, email: string) {
    const finalData = { ...formData, email } as FullFormData;
    
    if (!finalData.fullName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please go back to step 1 and complete all required fields.",
      });
      return;
    }

    toast({
        title: "Saving Profile...",
        description: "Please wait while we set up your household profile.",
    });

    try {
      // Save user profile to Firestore (server-side)
      const result = await saveHouseholdProfile(finalData, userId);
      
      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Your household account has been created with OAuth.",
        });
        router.push("/household/register/success");
      } else {
        toast({
            title: "Profile Save Failed",
            description: result.error || "Account created but failed to save profile.",
            variant: "destructive",
        });
      }
    } catch (error) {
       console.error('OAuth registration error:', error);
       toast({
            title: "Registration Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
        });
    }
  }

  async function onSubmit(values: z.infer<typeof Step3Schema>) {
    const finalData = { ...formData, ...values } as FullFormData;
    
    if (!finalData.email || !finalData.fullName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please go back to step 1 and complete all required fields.",
      });
      return;
    }

    toast({
        title: "Creating Account...",
        description: "Please wait while we set up your household profile.",
    });

    try {
      // Step 1: Create Firebase Auth user (client-side)
      const authResult = await signUpWithEmailAndPassword(finalData.email, finalData.password);
      
      if (!authResult.success || !authResult.uid) {
        toast({
          title: "Registration Failed",
          description: authResult.error || "Failed to create user account.",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Save user profile to Firestore (server-side)
      const result = await saveHouseholdProfile(finalData, authResult.uid);
      
      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Your household account has been created.",
        });
        router.push("/household/register/success");
      } else {
        toast({
            title: "Profile Save Failed",
            description: result.error || "Account created but failed to save profile.",
            variant: "destructive",
        });
      }
    } catch (error) {
       console.error('Registration error:', error);
       toast({
            title: "Registration Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
        });
    }
  }

  return (
    <>
      <Progress value={100} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Step 3: Final step</CardDescription>
        </CardHeader>
        <CardContent>
          <OAuthButtons 
            onSuccess={handleOAuthSuccess}
            disabled={form.formState.isSubmitting}
          />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the terms and conditions.
                      </FormLabel>
                       <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        By checking this box, you agree to our{" "}
                        <Link href="/terms" className="underline">Terms of Service</Link> and {" "}
                        <Link href="/privacy" className="underline">Privacy Policy</Link>.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>Back</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
