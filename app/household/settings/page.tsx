
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AlertTriangle } from "lucide-react"
import { ReportIssueForm } from "./report-issue-form"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { getHouseholdProfile, updateHouseholdProfile, HouseholdSettingsSchema, HouseholdProfile, changeHouseholdPassword, updateNotificationPreferences } from "./actions"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"


export default function SettingsPage() {
    const { user } = useAuth();
    const [isReportFormOpen, setIsReportFormOpen] = React.useState(false);
    const [profile, setProfile] = React.useState<HouseholdProfile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [emailNotifications, setEmailNotifications] = React.useState(true);
    const [smsNotifications, setSmsNotifications] = React.useState(false);
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const { toast } = useToast();

    const form = useForm<z.infer<typeof HouseholdSettingsSchema>>({
        resolver: zodResolver(HouseholdSettingsSchema),
        defaultValues: {
            fullName: "",
            email: "",
        },
    });

    React.useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            setLoading(true);
            const profileData = await getHouseholdProfile(user.uid);
            if (profileData) {
                setProfile(profileData);
                form.reset(profileData);
                // Load notification preferences if present
                const prefs = (profileData as { notificationPrefs?: { email?: boolean; sms?: boolean } }).notificationPrefs;
                if (prefs) {
                    setEmailNotifications(prefs.email ?? true);
                    setSmsNotifications(prefs.sms ?? false);
                }
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to load profile",
                    description: "Could not find your profile data.",
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, [user, form, toast]);

    async function onSubmit(values: z.infer<typeof HouseholdSettingsSchema>) {
        if (!profile?.id) return;
        toast({ title: "Updating profile..." });
        const result = await updateHouseholdProfile(profile.id, values);
        if (result.success) {
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not save your changes. Please try again.",
            });
        }
    }

    async function handleChangePassword() {
        if (!user || !newPassword) return;
        toast({ title: "Changing password..." });
        const result = await changeHouseholdPassword(user, newPassword);
        if (result.success) {
            toast({ title: "Password Changed", description: "Your password has been updated." });
            setCurrentPassword("");
            setNewPassword("");
        } else {
            toast({ variant: "destructive", title: "Change Failed", description: result.error || "Could not change password." });
        }
    }

    async function handleNotificationChange(type: "email" | "sms", value: boolean) {
        if (!profile?.id) return;
        const prefs = {
            email: type === "email" ? value : emailNotifications,
            sms: type === "sms" ? value : smsNotifications,
        };
        const result = await updateNotificationPreferences(profile.id, prefs);
        if (result.success) {
            toast({ title: "Preferences Updated", description: `Your ${type} notification preference has been updated.` });
            if (type === "email") setEmailNotifications(value);
            if (type === "sms") setSmsNotifications(value);
        } else {
            toast({ variant: "destructive", title: "Update Failed", description: result.error || "Could not update preferences." });
        }
    }
    
    if (loading) {
        return (
             <div className="space-y-8">
                <Skeleton className="h-10 w-1/2" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-2/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-28" /></CardFooter>
                </Card>
             </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and preferences.</p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src="https://placehold.co/100x100.png" />
                                <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm text-muted-foreground">
                                Photo upload coming soon
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Saving..." : "Update Profile"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <Button type="button" onClick={handleChangePassword}>Change Password</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Choose how you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                           <Label htmlFor="email-notifications" className="font-semibold">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates via email.</p>
                        </div>
                        <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={v => handleNotificationChange("email", v)} />
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                           <Label htmlFor="sms-notifications" className="font-semibold">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates via SMS.</p>
                        </div>
                        <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={v => handleNotificationChange("sms", v)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Support & Safety</CardTitle>
                    <CardDescription>Get help and report issues.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button variant="outline" className="w-full justify-start text-left h-auto p-4" onClick={() => setIsReportFormOpen(true)}>
                        <AlertTriangle className="mr-4 h-6 w-6 text-destructive" />
                        <div>
                            <p className="font-semibold">Report an Issue</p>
                            <p className="text-sm text-muted-foreground">Report problems with the platform or a worker&apos;s conduct.</p>
                        </div>
                    </Button>
                </CardContent>
            </Card>

            <ReportIssueForm open={isReportFormOpen} onOpenChange={setIsReportFormOpen} />
        </Form>
    )
}
