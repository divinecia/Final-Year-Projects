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
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/icons/google-icon";
import { signIn, signInWithGitHub } from "@/lib/auth";
import { OAuthButtons } from "@/components/oauth-buttons";

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.5 2.3.93 2.87.71c.09-.55.34-1.04.62-1.28c-2.19-.25-4.5-1.1-4.5-4.88c0-1.08.39-1.96 1.03-2.65c-.1-.25-.45-1.25.1-2.62c0 0 .83-.26 2.72 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.47.34c1.89-1.28 2.72-1.02 2.72-1.02c.55 1.37.2 2.37.1 2.62c.64.69 1.03 1.57 1.03 2.65c0 3.79-2.31 4.63-4.5 4.88c.36.31.69.92.69 1.85V21c0 .27.16.58.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
);

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().default(false),
});

export default function WorkerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({ title: "Logging in...", description: "Please wait." });
    
    const result = await signIn(values.email, values.password, 'worker');

    if (result.success) {
      if (result.isNewUser) {
        router.push("/worker/register");
      } else {
        router.push("/worker/dashboard");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.error || "An unknown error occurred.",
      });
    }
  }

  async function handleGitHubSignIn() {
    const result = await signInWithGitHub('worker');
    if (result.success) {
        if (result.isNewUser) {
            router.push('/worker/register');
        } else {
            router.push('/worker/dashboard');
        }
    } else {
        toast({
            variant: "destructive",
            title: "GitHub Sign-In Failed",
            description: result.error || "Could not sign in with GitHub."
        });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-4">
            <Card className="w-full">
                <CardHeader className="text-center">
                    <CardTitle>Login to Your Worker Account</CardTitle>
                    <CardDescription>Access your dashboard and manage your jobs.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* OAuth login options */}
                    <div className="mb-6">
                        <p className="text-center text-sm mb-2">Login with:</p>
                        <div className="flex justify-center gap-4">
                          <OAuthButtons
                            onSuccess={() => {
                              router.push("/worker/dashboard");
                            }}
                          />
                        </div>
                        <div className="text-center text-xs text-muted-foreground mt-2">or use your email and password below</div>
                    </div>
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
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Logging In..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full">
                            <GoogleIcon className="mr-2 h-5 w-5" />
                            Continue with Google
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleGitHubSignIn}>
                            <GitHubIcon className="mr-2 h-5 w-5" />
                            Continue with GitHub
                        </Button>
                    </div>
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
