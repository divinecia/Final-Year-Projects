import * as z from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const Step1Schema = z.object({
  profilePicture: z.any()
    .refine((file) => file, "Profile picture is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender."
  }),
  nationalId: z.string().regex(/^\d{16}$/, "Please enter a valid 16-digit national ID."),
  district: z.string({ required_error: "Please select a district." }),
  sector: z.string({ required_error: "Please select a sector." }),
  address: z.string().min(5, "Please enter a detailed address."),
  emergencyContactName: z.string().min(2, "Contact name is required."),
  emergencyContactPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  emergencyContactRelationship: z.string().min(2, "Relationship is required."),
});

export const Step2Schema = z.object({
  experience: z.array(z.number()).default([0]),
  previousEmployers: z.string().optional(),
  description: z.string().optional(),
  services: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one service.",
  }),
  certificates: z.any().optional(),
  languages: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one language.",
  }),
});

export const Step3Schema = z.object({
  availableDays: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one day.",
  }),
  preferredHours: z.string().min(1, "Preferred hours are required."),
  flexibility: z.enum(["full-time", "part-time"], { required_error: "Please select a flexibility option." }),
  oneTimeJobs: z.boolean().default(false),
  recurringJobs: z.boolean().default(false),
  emergencyServices: z.boolean().default(false),
  travelDistance: z.array(z.number()).default([5]),
  hourlyRate: z.array(z.number()).default([500, 1000]),
});

export const Step4Schema = z.object({
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

export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;
export type Step3Data = z.infer<typeof Step3Schema>;
export type Step4Data = z.infer<typeof Step4Schema>;

export type WorkerFormData = Step1Data & Step2Data & Step3Data & Step4Data;
