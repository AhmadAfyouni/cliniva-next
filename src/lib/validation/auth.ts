import z from "zod";

export const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  rememberMe: z.boolean().default(false).optional(),
});
