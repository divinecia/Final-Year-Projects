import { z } from 'zod';

export const WorkerSettingsSchema = z.object({
  fullName: z.string()
    .min(2, { message: "Full name must be at least 2 characters." })
    .max(100, { message: "Full name must be at most 100 characters." }),
  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .or(z.literal("")),
  bio: z.string()
    .max(500, { message: "Bio must be at most 500 characters." })
    .optional(),
  services: z.array(z.string())
    .min(1, { message: "Select at least one service." }),
  languages: z.array(z.string())
    .min(1, { message: "Select at least one language." }),
  oneTimeJobs: z.boolean().default(false),
  recurringJobs: z.boolean().default(false),
  hourlyRate: z.array(z.number()
    .min(0, { message: "Hourly rate must be non-negative." }))
    .min(1, { message: "At least one hourly rate must be specified." })
    .default([1500]),
});

export type WorkerSettingsData = z.infer<typeof WorkerSettingsSchema>;

export type WorkerProfile = WorkerSettingsData & {
  id: string;
  phone: string;
};
