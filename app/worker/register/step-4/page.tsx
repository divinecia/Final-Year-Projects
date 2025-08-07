
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
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveWorkerProfile, FormData } from "../actions";
import { useFormContext } from "../form-provider";
import { signUpWithEmailAndPassword } from "@/lib/client-auth";
import { OAuthButtons } from "@/components/oauth-buttons";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const Step4Schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
  idFront: z.any()
    .refine((file) => file, "Front of ID is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  idBack: z.any()
    .refine((file) => file, "Back of ID is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  selfie: z.any()
    .refine((file) => file, "Selfie with ID is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  consent: z.boolean().refine(value => value, { message: "You must consent to the background check." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function WorkerRegisterStep4Page() {
  const router = useRouter();
  const { formData } = useFormContext();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof Step4Schema>>({
    resolver: zodResolver(Step4Schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      consent: formData.consent ?? false,
    },
  });

  // Handle OAuth sign-in success
  async function handleOAuthSuccess(userId: string, email: string) {
    const finalData = { ...formData, email } as FormData;
    
    if (!finalData.fullName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please go back to previous steps and complete all required fields.",
      });
      return;
    }

    toast({
        title: "Saving Profile...",
        description: "Please wait while we set up your worker profile.",
    });

    try {
      // Save user profile to Firestore (server-side)
      const result = await saveWorkerProfile(finalData, userId);
      
      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Your worker account has been created with OAuth.",
        });
        router.push("/worker/register/success");
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
  
  async function onSubmit(values: z.infer<typeof Step4Schema>) {
    const finalData = { ...formData, ...values } as FormData;

    if (!finalData.email) {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "An email address is required to create an account. Please go back to Step 1.",
      });
      return;
    }
    
    // Show initial processing message
    toast({
        title: "Processing Registration...",
        description: "Creating your account and processing documents.",
        duration: 2000,
    });

    try {
        // Step 1: Create Firebase Auth user (optimized)
        const authResult = await Promise.race([
          signUpWithEmailAndPassword(finalData.email, finalData.password),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Authentication timeout')), 10000)
          )
        ]) as { success: boolean; uid?: string; error?: string };
        
        if (!authResult.success || !authResult.uid) {
          toast({
            title: "Registration Failed",
            description: authResult.error || "Failed to create user account.",
            variant: "destructive",
          });
          return;
        }

        // Show progress update
        toast({
            title: "Account Created!",
            description: "Saving your profile and uploading documents...",
            duration: 2000,
        });

        // Step 2: Save worker profile to Firestore (optimized with timeout)
        const result = await Promise.race([
          saveWorkerProfile(finalData, authResult.uid),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile save timeout')), 15000)
          )
        ]) as { success: boolean; error?: string };
        
        if (result.success) {
            toast({
              title: "🎉 Registration Successful!",
              description: "Your worker application has been submitted successfully. You'll be redirected shortly.",
              duration: 4000,
            });
            
            // Redirect after showing success message
            setTimeout(() => {
              router.push("/worker/register/success");
            }, 1500);
        } else {
             toast({
                title: "Profile Save Failed",
                description: result.error || "Account created but failed to save profile.",
                variant: "destructive",
            })
        }
    } catch (error) {
        console.error("Registration failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        
        toast({
            title: "Registration Failed",
            description: errorMessage.includes('timeout') 
              ? "The request is taking too long. Please check your connection and try again."
              : "An unexpected error occurred. Please try again.",
            variant: "destructive",
        })
    }
  }

  const FileUpload = ({ field, label, capture }: { 
    field: { name: keyof z.infer<typeof Step4Schema>; onChange: (file: File | null) => void; value?: File | null }, 
    label: string, 
    capture?: boolean | "user" | "environment" 
  }) => {
    const [fileName, setFileName] = React.useState<string | null>(null);
    const [isUploaded, setIsUploaded] = React.useState<boolean>(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        field.onChange(file);
        setFileName(file.name);
        setIsUploaded(true);
        
        // Show success notification for document upload
        toast({
          title: "Document Uploaded Successfully!",
          description: `${label} has been uploaded successfully.`,
          duration: 3000,
        });
      }
    };

    const handleClick = () => {
      if (capture && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        if (capture && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        // For selfie with camera capture, ensure camera access
        const constraints: MediaStreamConstraints = {
          video: capture === true ? { facingMode: 'user' } : { facingMode: capture as 'user' | 'environment' }
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
          .then(() => {
            fileInputRef.current?.click();
          })
          .catch((error) => {
            console.error('Camera access denied:', error);
            toast({
              variant: "destructive",
              title: "Camera Access Required",
              description: "Camera access is required for selfie capture"
            });
            return;
          });
      } else {
        fileInputRef.current?.click();
      }
      } else {
        fileInputRef.current?.click();
      }
    };

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      {...(capture ? { capture } : {})} 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    <div 
                      onClick={handleClick}
                      className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer transition-all duration-200 hover:border-primary ${
                        isUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                        {capture ? (
                          <Camera className={`w-8 h-8 ${isUploaded ? 'text-green-600' : 'text-gray-400'}`} />
                        ) : (
                          <Upload className={`w-8 h-8 ${isUploaded ? 'text-green-600' : 'text-gray-400'}`} />
                        )}
                        <span className={`ml-2 text-sm truncate ${
                          isUploaded ? 'text-green-700 font-medium' : 'text-muted-foreground'
                        }`}>
                          {fileName || (capture ? "Take Photo with Camera" : "Click to upload")}
                        </span>
                        {isUploaded && (
                          <div className="ml-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                    </div>
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    )
  }

  return (
    <>
      <Progress value={100} className="w-full mb-4" />
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Step 4: Almost there!</CardDescription>
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
                name="idFront"
                render={({ field }) => <FileUpload field={field} label="Front of National ID" />}
              />
              <FormField
                control={form.control}
                name="idBack"
                render={({ field }) => <FileUpload field={field} label="Back of National ID" />}
              />
              <FormField
                control={form.control}
                name="selfie"
                render={({ field }) => <FileUpload field={field} label="Selfie with ID" capture={"user" as const} />}
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
                        I consent to a background check and agree to the terms.
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
                  {form.formState.isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
