import { z } from "zod"

// Strips ASCII control characters plus markup-adjacent characters that have
// no business in a name/email field (angle brackets, backticks).
// eslint-disable-next-line no-control-regex -- intentional: stripping control chars
const CONTROL_OR_MARKUP_CHARS = /[\x00-\x1F\x7F<>`]/g

export function sanitizeText(value: string) {
  return value.replace(CONTROL_OR_MARKUP_CHARS, "").trim().replace(/\s+/g, " ")
}

export function sanitizeEmail(value: string) {
  return value.replace(CONTROL_OR_MARKUP_CHARS, "").trim().toLowerCase()
}

const nameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(60, "Full name must be under 60 characters.")
  .regex(
    /^[A-Za-z' -]+$/,
    "Full name can only contain letters, spaces, apostrophes, and hyphens."
  )

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(254, "Email is too long.")
  .email("Enter a valid email address.")

const signupPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password must be under 64 characters.")
  .regex(
    /^[A-Za-z0-9]+$/,
    "Password can only contain letters and numbers (no spaces or symbols)."
  )

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
})

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: signupPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>
export type SignupFieldErrors = Partial<Record<keyof SignupInput, string>>
