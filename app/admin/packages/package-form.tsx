"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { serviceOptions } from "@/lib/services"
import { packageSchema, createPackage, updatePackage, type ServicePackage } from "./actions";

type PackageFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: () => void;
  initialData?: ServicePackage | null;
}

export function PackageForm({ open, onOpenChange, onFormSubmit, initialData }: PackageFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: 0,
      billingCycle: "monthly",
      description: "",
      services: [],
    },
  });

  // Only reset if initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        price: Number(initialData.price) || 0,
        billingCycle: initialData.billingCycle as 'one-time' | 'weekly' | 'monthly' | undefined,
        services: initialData.services || [],
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        billingCycle: undefined,
        description: "",
        services: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  async function onSubmit(values: z.infer<typeof packageSchema>) {
    const action = isEditing ? "Updating" : "Creating";
    toast({
      title: `${action} Package...`,
      description: `The service package is being ${isEditing ? 'updated' : 'added'}.`,
    });

    const result = isEditing && initialData?.id
        ? await updatePackage(initialData.id, values)
        : await createPackage(values);

    if (result.success) {
        toast({
            title: "Success!",
            description: `Package &ldquo;${values.name}&rdquo; has been ${isEditing ? "updated" : "created"}.`,
        });
        onFormSubmit();
        onOpenChange(false);
    } else {
        let errorMsg = result.error || `Could not ${isEditing ? 'update' : 'create'} the package.`;
        if (typeof errorMsg !== 'string') {
            if (Array.isArray(errorMsg)) {
                errorMsg = errorMsg.join(', ');
            } else {
                errorMsg = JSON.stringify(errorMsg);
            }
        }
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMsg
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create New'} Service Package</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the service package.' : 'Fill in the details below to create a new service package.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic Weekly Cleaning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (RWF)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 25000"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Cycle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this package includes." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Included Services</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {serviceOptions.map((service) => (
                      <div key={service.id} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(service.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                field.onChange([...(field.value || []), service.id]);
                              } else {
                                field.onChange(field.value?.filter((value) => value !== service.id));
                              }
                            }}
                            aria-label={service.label}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{service.label}</FormLabel>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isValid}
                aria-label={isEditing ? "Save Changes" : "Create Package"}
              >
                {form.formState.isSubmitting
                  ? (isEditing ? 'Saving...' : 'Creating...')
                  : (isEditing ? 'Save Changes' : 'Create Package')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
