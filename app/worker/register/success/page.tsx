"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function RegistrationSuccessPage() {
    const router = useRouter();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/worker/login');
        }, 2000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="mt-4">Application Submitted Successfully!</CardTitle>
                    <CardDescription>
                        Your application is under review. We&apos;ll notify you within 24-48 hours via SMS once the verification is complete.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You will be redirected to the login page shortly.
                    </p>
                    <Button onClick={() => router.push('/worker/login')}>
                        Continue to Login
                    </Button>
                     <p className="text-xs text-muted-foreground pt-4">
                        If you have any questions, please contact our support team at <a href="mailto:support@househelp.app" className="underline">support@househelp.app</a>.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
