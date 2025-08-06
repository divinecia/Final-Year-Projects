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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { registerAdmin } from "./actions";

// Improved: Added stricter validation and trimmed input
const formSchema = z.object({
    fullName: z.string().min(2, "Full name is required.").trim(),
    employeeId: z.string().min(1, "Employee ID is required.").trim(),
    email: z.string().email("A valid official email is required.").trim(),
    phone: z.string().regex(/^0\d{9}$/, "Please enter a valid 10-digit phone number starting with 0."),
    department: z.enum(["it", "customer_service", "hr", "finance", "management"], { required_error: "Department is required." }),
    roleLevel: z.enum(["support_agent", "manager", "super_admin"], { required_error: "Role level is required." }),
    password: z.string().min(8, "Password must be at least 8 characters."),
});

export default function AdminRegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            employeeId: "",
            email: "",
            phone: "",
            department: undefined,
            roleLevel: undefined,
            password: "",
        },
        mode: "onTouched", // Improved: Validate on touch for better UX
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        toast({
            title: "Creating Admin Account",
            description: "Setting up the new administrator account.",
        });

        try {
            const result = await registerAdmin(values);
            if (result.success) {
                toast({
                    title: "Success!",
                    description: `${values.fullName} has been added as an admin.`,
                });
                router.push("/admin/settings");
            } else {
                toast({
                    variant: "destructive",
                    title: "Registration Failed",
                    description: result.error || "Could not create admin account.",
                });
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
            });
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
            <div className="w-full max-w-lg space-y-4">
                <Card className="w-full shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Logo className="h-16 w-16" />
                        </div>
                        <CardTitle>Househelp Admin Portal</CardTitle>
                        <CardDescription>Create a New Administrator Account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. Jane Doe"
                                                        autoComplete="name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="employeeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employee ID</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. HH-001"
                                                        autoComplete="off"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Official Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="name@househelp.app"
                                                    autoComplete="email"
                                                    {...field}
                                                />
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
                                                <Input
                                                    type="tel"
                                                    placeholder="07..."
                                                    autoComplete="tel"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Department</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Department" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="it">IT</SelectItem>
                                                        <SelectItem value="customer_service">Customer Service</SelectItem>
                                                        <SelectItem value="hr">Human Resources</SelectItem>
                                                        <SelectItem value="finance">Finance</SelectItem>
                                                        <SelectItem value="management">Management</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="roleLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role Level</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Role" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="support_agent">Support Agent</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Temporary Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between items-center pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/admin/settings">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? "Creating Account..." : "Create Admin Account"}
                                    </Button>
                                </div>
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
