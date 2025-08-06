import * as z from "zod";

export const Step1Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  email: z.string().email("Please enter a valid email address."),
  district: z.string({ required_error: "Please select a district." }),
  sector: z.string({ required_error: "Please select a sector." }),
  address: z.string().min(5, "Please enter a detailed address."),
  propertyType: z.enum(["single_family", "apartment", "townhouse", "condominium", "villa", "duplex", "servant_quarters"], { required_error: "Please select a property type."}),
  numRooms: z.coerce.number().min(1, "Must have at least one room."),
  hasGarden: z.enum(["yes", "no"]),
});

export const Step2Schema = z.object({
  numAdults: z.coerce.number().min(1),
  numChildren: z.coerce.number().min(0).default(0),
  hasPets: z.boolean().default(false),
  petInfo: z.string().optional(),
  primaryServices: z.array(z.string()).refine((val) => val.length > 0, { message: "Select at least one service."}),
  serviceFrequency: z.string().min(1, "Frequency is required."),
});

export const Step3Schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
  consent: z.boolean().refine(value => value, { message: "You must agree to the terms." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;
export type Step3Data = z.infer<typeof Step3Schema>;

export type HouseholdFormData = Step1Data & Step2Data & Step3Data;
