import { z } from 'zod';

// --- BOOKING VALIDATION ---
export const BookingSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Phone number too short'),
  pickup: z.string().min(3, 'Pickup address required'),
  destination: z.string().min(3, 'Destination address required'),
  pickupAt: z.string().datetime(), // ISO 8601
  flightNumber: z.string().optional(),
  passengers: z.number().min(1).max(8),
  luggage: z.number().min(0).max(8),
  vehicleType: z.enum(['Limo', 'Kombi', 'Bus']),
  notes: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

// --- DRIVER VALIDATION ---
export const DriverSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  active: z.boolean().default(true),
});

export type DriverInput = z.infer<typeof DriverSchema>;

// --- REVIEW VALIDATION ---
export const ReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;
