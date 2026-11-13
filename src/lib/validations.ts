import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and dashes'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),
  role: z.enum(['GAMER', 'CRITIC']).optional().default('GAMER'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createReviewSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  isRecommended: z.boolean(),
  title: z.string().min(3, 'Headline must be at least 3 characters').max(100, 'Headline is too long'),
  content: z.string().min(10, 'Review content must be at least 10 characters long').max(2500, 'Review is too long'),
  isAnonymous: z.boolean().default(false),
  hoursPlayed: z.number().min(0, 'Hours played cannot be negative').optional().default(0),
});

export const updateReviewSchema = createReviewSchema.partial().omit({ gameId: true });

export const createGameSchema = z.object({
  title: z.string().min(2, 'Game title must be at least 2 characters'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters'),
  description: z.string().min(20, 'Detailed description must be at least 20 characters long'),
  coverImage: z.string().url('Please enter a valid cover image URL'),
  bannerImage: z.string().url('Please enter a valid banner image URL'),
  category: z.string().min(2, 'Category is required'),
  playerModes: z.array(z.enum(['Singleplayer', 'Multiplayer', 'Co-op', 'MMO'])).min(1, 'Select at least one player mode'),
  developer: z.string().min(2, 'Developer name is required'),
  publisher: z.string().min(2, 'Publisher name is required'),
  releaseDate: z.string().min(4, 'Release date is required'),
  price: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
});

export const gameQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  playerMode: z.string().optional(),
  sort: z.enum(['rating_desc', 'rating_asc', 'reviews_desc', 'newest', 'title']).optional().default('rating_desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type GameQueryInput = z.infer<typeof gameQuerySchema>;
