
"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { createJobPost, type JobPostFormData, jobPostSchema } from "./actions"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { getServiceOptions, getLocationOptions } from "@/lib/services-api"
import { getPayFrequencyOptions } from "@/lib/system-config"

export default function PostJobPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = React.useState<Array<{ id: string; label: string; price: number }>>([]);
  const [locations, setLocations] = React.useState<Array<{ 
    district: string; 
    province: string; 
    sectors: Array<{ id: string; label: string }> 
  }>>([]);
  const [payFrequencies, setPayFrequencies] = React.useState<Array<{ id: string; label: string; description: string }>>([]);
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      jobTitle: "",
      serviceType: undefined,
      jobDescription: "",
      schedule: "",
      district: undefined,
      sector: undefined,
      salary: 0,
      payFrequency: undefined,
      benefits: {
        accommodation: false,
        meals: false,
        transportation: false,
      },
    },
  });

  // Load services and locations on component mount
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [servicesData, locationsData, payFrequenciesData] = await Promise.all([
          getServiceOptions(),
          getLocationOptions(),
          getPayFrequencyOptions()
        ]);
        
        setServices(servicesData);
        setLocations(locationsData);
        setPayFrequencies(
          payFrequenciesData.map(f => ({
            id: f.id,
            label: f.label,
            description: f.description ?? "",
          }))
        );
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load services and locations. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [toast]);

  // Get current district&apos;s sectors
  const currentSectors = React.useMemo(() => {
    if (!selectedDistrict) return [];
    const district = locations.find(loc => loc.district === selectedDistrict);
    return district ? district.sectors : [];
  }, [selectedDistrict, locations]);

  // Update suggested salary when service type changes
  const serviceType = form.watch('serviceType');
  const selectedService = React.useMemo(() => {
    return services.find(service => service.id === serviceType);
  }, [serviceType, services]);

  React.useEffect(() => {
    if (selectedService) {
      form.setValue('salary', selectedService.price);
    }
  }, [selectedService, form]);

  async function onSubmit(values: JobPostFormData) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to post a job.",
        });
        return;
    }

    toast({
      title: "Posting Job...",
      description: "Your custom job is being submitted.",
    });
    
    const result = await createJobPost(user.uid, values);

    if (result.success) {
        toast({
            title: "Success!",
            description: `Your job "${values.jobTitle}" has been posted.`,
        });
        form.reset();
        router.push("/household/bookings"); // Redirect to a relevant page
    } else {
         toast({
            variant: "destructive",
            title: "Error",
            description: result.error || `Could not post your job.`,
        });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post a Custom Job</h1>
          <p className="text-muted-foreground">Describe your specific needs and let workers apply.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create a Job Posting</CardTitle>
          <CardDescription>Fill out the form below. The more detail you provide, the better the matches you&apos;ll get.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Part-time Nanny & Housekeeper" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select the main service category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>Loading services...</SelectItem>
                        ) : (
                          services.map(service => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.label} - {service.price.toLocaleString()} RWF/hour
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedService && (
                      <FormDescription>
                        Base rate: {selectedService.price.toLocaleString()} RWF per hour
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe the daily tasks, responsibilities, and any specific requirements for the job. Mention the work environment." rows={5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule and Hours</FormLabel>
                    <FormControl><Input placeholder="e.g., Monday-Friday, 8am-5pm" {...field} /></FormControl>
                    <FormDescription>Be as specific as possible about the required days and times.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select 
                          onValueChange={(value: string) => {
                            field.onChange(value);
                            setSelectedDistrict(value);
                            form.setValue('sector', ''); // Clear sector when district changes
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoading ? (
                              <SelectItem value="loading" disabled>Loading districts...</SelectItem>
                            ) : (
                              locations.map(location => (
                                <SelectItem key={location.district} value={location.district}>
                                  {location.district} ({location.province})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currentSectors.length === 0 ? (
                              <SelectItem value="none" disabled>
                                {selectedDistrict ? 'No sectors available' : 'Select district first'}
                              </SelectItem>
                            ) : (
                              currentSectors.map(sector => (
                                <SelectItem key={sector.id} value={sector.id}>
                                  {sector.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Compensation & Benefits</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Salary (RWF)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 100000" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="payFrequency"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pay Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a frequency" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {isLoading ? (
                              <SelectItem value="loading" disabled>Loading pay frequencies...</SelectItem>
                            ) : (
                              payFrequencies.map(frequency => (
                                <SelectItem key={frequency.id} value={frequency.id}>
                                  {frequency.label}
                                </SelectItem>
                              ))
                            )}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                <FormField
                    control={form.control}
                    name="benefits"
                    render={() => (
                    <FormItem>
                        <FormLabel>Additional Benefits Offered (Optional)</FormLabel>
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="benefits.accommodation"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="font-normal">Accommodation</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="benefits.meals"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="font-normal">Meals Provided</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="benefits.transportation"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="font-normal">Transportation Allowance</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              <div className="text-sm text-muted-foreground pt-4">
                By posting this job, you agree to provide a safe work environment and treat workers with respect and fairness, in accordance with our platform guidelines.
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
