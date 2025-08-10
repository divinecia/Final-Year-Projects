
"use client"

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { serviceOptions } from "@/lib/services"
import { Slider } from "@/components/ui/slider"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { WorkerSettingsSchema, type WorkerProfile } from "@/lib/schemas/worker"
import { uploadFile } from "@/lib/storage"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { InsuranceSelection } from "./insurance-selection"


const LANGUAGES = [
    { id: "kinyarwanda", label: "Kinyarwanda" },
    { id: "english", label: "English" },
    { id: "french", label: "French" },
    { id: "swahili", label: "Swahili" },
];

export default function WorkerSettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [worker, setWorker] = useState<WorkerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [selectedInsurance, setSelectedInsurance] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof WorkerSettingsSchema>>({
        resolver: zodResolver(WorkerSettingsSchema),
        defaultValues: {
            fullName: "",
            email: "",
            bio: "",
            services: [],
            languages: [],
            oneTimeJobs: false,
            recurringJobs: false,
            hourlyRate: [1500],
        }
    });

        useEffect(() => {
        const fetchWorkerProfile = async () => {
            if (!user?.uid) return;
            
            try {
                const response = await fetch(`/api/worker/profile?workerId=${user.uid}`);
                if (response.ok) {
                    const profileData = await response.json();
                    if (profileData) {
                        setWorker(profileData);
                        form.reset({
                            fullName: profileData.fullName,
                            email: profileData.email,
                            bio: profileData.bio,
                            services: profileData.services,
                            languages: profileData.languages,
                            oneTimeJobs: profileData.oneTimeJobs,
                            recurringJobs: profileData.recurringJobs,
                            hourlyRate: profileData.hourlyRate,
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching worker profile:", error);
                toast({
                    title: "Error",
                    description: "Failed to load profile data.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWorkerProfile();
    }, [user, form, toast]);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            try {
                toast({ title: "Uploading photo..." });
                
                // Upload to Firebase Storage
                const photoURL = await uploadFile(file, `workers/${user.uid}/profile/`);
                
                // Update local preview
                setProfileImage(photoURL);
                
                // Update profile in database via API
                if (worker) {
                    const response = await fetch('/api/worker/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            workerId: worker.id,
                            data: { profilePictureUrl: photoURL },
                        }),
                    });
                    
                    if (!response.ok) throw new Error('Failed to update profile');
                }
                
                toast({
                    title: "Photo Updated",
                    description: "Your profile photo has been updated successfully.",
                });
            } catch (error) {
                console.error('Photo upload error:', error);
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: "Could not upload your photo. Please try again.",
                });
            }
        }
    };

    const onSubmit = async (values: z.infer<typeof WorkerSettingsSchema>) => {
        if (!worker) return;

        try {
            const response = await fetch('/api/worker/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workerId: worker.id,
                    data: values,
                }),
            });

            const result = await response.json();
            
            if (result.success) {
                toast({
                    title: "Success!",
                    description: "Your profile has been updated.",
                });
            } else {
                throw new Error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        }
    };
    
    if (loading) {
        return (
             <div className="space-y-8">
                <Skeleton className="h-10 w-1/2" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
                </Card>
             </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings & Profile</h1>
                    <p className="text-muted-foreground">Manage your public profile, availability, and account settings.</p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Public Profile</CardTitle>
                        <CardDescription>This is how your profile will appear to households.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profileImage || user?.photoURL || "https://placehold.co/100x100.png"} data-ai-hint="man portrait" />
                                <AvatarFallback>{worker?.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange} 
                            />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
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
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem><FormLabel>Your Bio</FormLabel><FormControl><Textarea placeholder="Tell households a little about yourself..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Skills & Experience</CardTitle>
                        <CardDescription>Update your services and languages to get better job matches.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <FormField
                            control={form.control}
                            name="services"
                            render={() => (
                                <FormItem>
                                <FormLabel>Services You Offer</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                    {serviceOptions.map((service) => (
                                        <FormField
                                        key={service.id}
                                        control={form.control}
                                        name="services"
                                        render={({ field }) => {
                                            return (
                                            <FormItem key={service.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(service.id)}
                                                    onCheckedChange={(checked: boolean) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), service.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value: string) => value !== service.id
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">{service.label}</FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="languages"
                            render={() => (
                                <FormItem>
                                <FormLabel>Languages You Speak</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                    {LANGUAGES.map((lang) => (
                                        <FormField
                                        key={lang.id}
                                        control={form.control}
                                        name="languages"
                                        render={({ field }) => {
                                            return (
                                            <FormItem key={lang.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(lang.id)}
                                                    onCheckedChange={(checked: boolean) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), lang.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value: string) => value !== lang.id
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">{lang.label}</FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Availability & Rate</CardTitle>
                        <CardDescription>Set your working hours, preferences, and desired pay.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="font-semibold">Service Preferences</Label>
                            <div className="flex flex-col space-y-2">
                                <FormField
                                    control={form.control}
                                    name="oneTimeJobs"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel className="font-normal">Open to One-time Jobs</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="recurringJobs"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel className="font-normal">Open to Recurring Jobs</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="hourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Desired Hourly Rate: RWF {field.value?.[0]}</FormLabel>
                                    <FormControl>
                                        <Slider
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            max={5000}
                                            min={500}
                                            step={100}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <InsuranceSelection 
                    selectedInsuranceId={selectedInsurance}
                    onInsuranceChange={setSelectedInsurance}
                />

                <div className="flex justify-end">
                    <Button type="submit">Save All Changes</Button>
                </div>
            </form>
        </Form>
    )
}
