import { z } from "zod";

// --- Auth Validations ---
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// --- Turf Validations ---
export const turfSchema = z.object({
  name: z.string().min(3, "Turf name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(5, "Location is required"),
  pricePerHour: z.coerce.number().min(1, "Price must be greater than 0"),
  capacity: z.union([z.coerce.number().min(1, "Capacity must be at least 1"), z.literal("")]).optional().transform(e => e === "" ? undefined : e),
  operatingHours: z.string().optional(),
  sports: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
});

export type TurfInput = z.infer<typeof turfSchema>;

// --- Booking Validations ---
export const bookingSchema = z.object({
  turfId: z.string().uuid(),
  date: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// --- Review Validations ---
export const reviewSchema = z.object({
  turfId: z.string().uuid(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
