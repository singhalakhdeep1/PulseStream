import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
    full_name: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createPostSchema = z.object({
    content: z.string().min(1, "Post cannot be empty").max(2000, "Post too long"),
});

export const updateProfileSchema = z.object({
    full_name: z.string().min(1).max(100).optional(),
    bio: z.string().max(200).optional(),
    website: z.string().url().optional().or(z.literal("")),
    location: z.string().max(100).optional(),
});
