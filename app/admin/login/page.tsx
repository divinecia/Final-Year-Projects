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
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const formSchema = z.object({
  email: z.string().email("Official email is required."),
  password: z.string().min(1, "Password is required."),
  twoFactorCode: z.string().optional(),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isRedirecting) return; // Prevent multiple submissions
    
    toast({
      title: "Logging In...",
      description: "Authenticating administrator.",
    });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userId = userCredential.user.uid;

      const adminDoc = await getDoc(doc(db, "admin", userId));
      if (!adminDoc.exists()) {
        await auth.signOut();
        toast({
          title: "Access Denied",
          description: "You do not have administrator privileges.",
          variant: "destructive",
        });
        return;
      }

      const adminData = adminDoc.data();
      if (!adminData.isActive) {
        await auth.signOut();
        toast({
          title: "Account Suspended",
          description: "Your admin account has been suspended. Contact system administrator.",
          variant: "destructive",
        });
        return;
      }

      // Placeholder: Two-factor code verification logic
      if (adminData.twoFactorEnabled) {
        if (!values.twoFactorCode || values.twoFactorCode !== adminData.twoFactorCode) {
          await auth.signOut();
          toast({
            title: "Two-Factor Authentication Failed",
            description: "Invalid or missing two-factor code.",
            variant: "destructive",
          });
          return;
        }
      }

      // Update last login
      await updateDoc(doc(db, "admin", userId), {
        lastLogin: new Date(),
        updatedAt: new Date(),
      });

      // Show success message and set redirecting state
      setIsRedirecting(true);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${adminData.fullName || "Administrator"}! Redirecting...`,
      });

      // Small delay to ensure auth state is updated, then redirect
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    } catch (error: unknown) {
      let errorMessage = "Login failed. Please try again.";
      if (typeof error === "object" && error !== null && "code" in error) {
        const err = error as { code?: string; message?: string };
        switch (err.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email address.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled.";
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-muted/40">
      <div className="w-full max-w-md space-y-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo className="h-16 w-16" />
            </div>
            <CardTitle>Admin Portal Access</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Email / Employee ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your official email"
                          autoComplete="username"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
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
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twoFactorCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Two-Factor Code (if enabled)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="6-digit code"
                          autoComplete="one-time-code"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right">
                  <Button variant="link" asChild className="p-0 h-auto" tabIndex={-1}>
                    <Link href="/forgot-password">Forgot Password?</Link>
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || isRedirecting}>
                  {isRedirecting ? "Redirecting..." : isSubmitting ? "Logging In..." : "Secure Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          For assistance, please{" "}
          <Link href="/support" className="font-semibold text-primary hover:underline">
            Contact IT Support
          </Link>
        </div>
      </div>
    </main>
  );
}
