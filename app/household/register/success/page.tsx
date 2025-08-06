"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function HouseholdRegistrationSuccessPage() {
    const router = useRouter();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/household/login');
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="mt-4">Account Created Successfully!</CardTitle>
                    <CardDescription>
                        Welcome to Househelp! You can now log in to find trusted help for your home.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You will be redirected to the login page shortly.
                    </p>
                    <Button onClick={() => router.push('/household/login')}>
                        Continue to Login
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
