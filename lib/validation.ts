import * as z from "zod"

// Common validation schemas
export const phoneSchema = z.string()
  .trim()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must not exceed 15 digits")
  .regex(/^\+?[0-9\-()\s]{10,15}$/, "Invalid phone number format")

export const emailSchema = z.string()
  .trim()
  .email("Invalid email format")
  .min(1, "Email is required")

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")

export const nameSchema = z.string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")

export const nationalIdSchema = z.string()
  .trim()
  .regex(/^\d{16}$/, "National ID must be exactly 16 digits")

export const addressSchema = z.string()
  .trim()
  .min(5, "Address must be at least 5 characters")
  .max(200, "Address must not exceed 200 characters")

export const bioSchema = z.string()
  .trim()
  .max(500, "Bio must not exceed 500 characters")
  .optional()

export const salarySchema = z.number()
  .min(1, "Salary must be greater than 0")
  .max(10000000, "Salary must be reasonable")

export const ratingSchema = z.number()
  .min(1, "Rating must be at least 1")
  .max(5, "Rating must not exceed 5")

// File validation schemas
export const imageFileSchema = z.any()
  .refine((file) => file instanceof File, "Must be a file")
  .refine((file) => file?.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
  .refine(
    (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file?.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported"
  )

export const documentFileSchema = z.any()
  .refine((file) => file instanceof File, "Must be a file")
  .refine((file) => file?.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
  .refine(
    (file) => [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ].includes(file?.type),
    "Only PDF, DOC, and DOCX formats are supported"
  )

// Common form validation helpers
export function validateRequired<T>(value: T, fieldName: string): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} is required`)
  }
  return value
}

export function validateEmail(email: string): string {
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }
  return result.data
}

export function validatePhone(phone: string): string {
  const result = phoneSchema.safeParse(phone)
  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }
  return result.data
}

export function validatePassword(password: string): string {
  const result = passwordSchema.safeParse(password)
  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }
  return result.data
}