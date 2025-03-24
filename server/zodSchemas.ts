import { z } from 'zod';

// User Registration
export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  profilePicture: z.string().url().optional(),
});

// Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Match
export const matchSchema = z.object({
  user1Id: z.string(),
  user2Id: z.string(),
  matchScore: z.number().min(0).max(100),
  status: z.enum(['pending', 'accepted', 'rejected']),
});

// Message
export const messageSchema = z.object({
  matchId: z.string(),
  senderId: z.string(),
  content: z.string().min(1),
  messageType: z.enum(['text', 'image', 'voice']).default('text'),
  mediaUrl: z.string().url().optional(),
});

// Session
export const sessionSchema = z.object({
  matchId: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
});
