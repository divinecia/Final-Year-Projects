"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { verifyPasswordResetCode } from "@/lib/auth";

const formSchema = z.object({
  code: z.string().length(6, "The verification code must be 6 digits."),
});

export default function VerifyPasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contact = searchParams.get('contact');
  const verificationId = searchParams.get('verificationId'); // Get verificationId from URL
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!contact || !verificationId) {
        toast({ variant: "destructive", title: "Error", description: "Missing verification details." });
        return;
    }
    
    toast({ title: "Verifying code..." });

    const result = await verifyPasswordResetCode(verificationId, values.code);

    if (result.success) {
        toast({ title: "Success!", description: "Verification successful." });
        router.push(`/forgot-password/reset?contact=${encodeURIComponent(contact)}`);
    } else {
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: result.error || "The code is incorrect. Please try again."
        });
    }
  }

  if (!contact || !verificationId) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <p>Verification details are missing. Please start over.</p>
            <Button asChild variant="link"><Link href="/forgot-password">Go Back</Link></Button>
        </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-4">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Enter Reset Code</CardTitle>
                    <CardDescription>
                        A 6-digit verification code was sent to <span className="font-semibold">{contact}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Verifying...' : 'Verify Code'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
