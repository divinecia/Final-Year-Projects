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
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/lib/auth";
import { OAuthButtons } from "@/components/oauth-buttons";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().default(false),
});

export default function WorkerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Show initial loading state with more descriptive message
    toast({ title: "Logging in...", description: "Please wait while we verify your credentials." });
    
    try {
      // Set timeout for performance optimization - prevent hanging requests
      const timeoutPromise = new Promise<{ success: false; error: string }>((_, reject) => 
        setTimeout(() => reject(new Error("Login is taking longer than expected. Please try again.")), 10000)
      );
      
      // Race login against timeout
      const result = await Promise.race([
        signIn(values.email, values.password, 'worker'),
        timeoutPromise
      ]);

      if (result.success) {
        // Show success message and set redirecting state
        setIsRedirecting(true);
        toast({ 
          title: "Login Successful! ✅", 
          description: "Welcome back!",
          duration: 2000
        });
        
        // Set session cookie for middleware
        if (result.user?.uid) {
          // Get the ID token and set it as a session cookie
          const idToken = await result.user.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
        }
        
        // Instant redirect for better performance
        setTimeout(() => {
          if (result.isNewUser) {
            router.push("/worker/register");
          } else {
            router.push("/worker/dashboard");
          }
        }, 100);
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error || "Invalid credentials. Please check your email and password.",
        });
      }
    } catch (error) {
      // Handle timeout or other errors
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Timeout",
        description: "The request is taking too long. Please check your connection and try again.",
      });
    }
  }

  // Handle social media authentication success
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSocialSuccess = async (userId: string, _email: string) => {
    setIsRedirecting(true);
    
    try {
      // Check if user exists in workers collection
      const { doc, getDoc } = await import("firebase/firestore");
      const userDoc = await getDoc(doc(db, "workers", userId));
      
      toast({
        title: "Login Successful! ✅",
        description: "Welcome!",
        duration: 2000
      });
      
      setTimeout(() => {
        if (!userDoc.exists()) {
          // New user - redirect to complete registration
          router.push("/worker/register/step-2");
        } else {
          // Existing user - go to dashboard
          router.push("/worker/dashboard");
        }
      }, 100);
    } catch (error) {
      console.error('Error checking user profile:', error);
      // Default to dashboard if error occurs
      router.push("/worker/dashboard");
    }
  };

  // Handle social media authentication error
  const handleSocialError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Social Login Failed",
      description: error,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-4">
            <Card className="w-full">
                <CardHeader className="text-center">
                    <CardTitle>Login to Your Worker Account</CardTitle>
                    <CardDescription>Access your dashboard and manage your jobs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input placeholder="name@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
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
                            <div className="flex items-center justify-between">
                                <FormField
                                    control={form.control}
                                    name="rememberMe"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href="/forgot-password">Forgot Password?</Link>
                                </Button>
                            </div>
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isRedirecting}>
                                {form.formState.isSubmitting ? "Logging In..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                    
                    {/* Social Media Login Options */}
                    <OAuthButtons
                      onSuccess={handleSocialSuccess}
                      onError={handleSocialError}
                      disabled={form.formState.isSubmitting || isRedirecting}
                    />
                </CardContent>
            </Card>
            <div className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/worker/register" className="font-semibold text-primary hover:underline">
                    Sign up here
                </Link>
            </div>
        </div>
    </main>
  );
}
