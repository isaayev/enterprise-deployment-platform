import { z } from 'zod';

/**
 * Zod schema that validates every environment variable the platform needs.
 *
 * • JWT_SECRET  — must be ≥ 32 chars; **required** in production.
 * • ADMIN_*     — required in production, safe defaults in dev.
 * • SENTRY_DSN  — optional in every environment.
 */

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  NODE_ENV: z
    .string()
    .default('development'),

  // ── JWT ──────────────────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default(isProduction ? undefined as unknown as string : 'nexus-gaming-dev-only-secret-never-use-in-production'),

  // ── Admin account ────────────────────────────────────────────────────
  ADMIN_EMAIL: z
    .string()
    .email('ADMIN_EMAIL must be a valid email address')
    .default(isProduction ? undefined as unknown as string : 'admin@enterprise.gg'),

  ADMIN_USERNAME: z
    .string()
    .min(1, 'ADMIN_USERNAME must not be empty')
    .default(isProduction ? undefined as unknown as string : 'NexusAdmin'),

  ADMIN_PASSWORD: z
    .string()
    .min(8, 'ADMIN_PASSWORD must be at least 8 characters')
    .default(isProduction ? undefined as unknown as string : 'dev-only-password-do-not-use'),

  // ── Sentry (optional) ───────────────────────────────────────────────
  SENTRY_DSN: z
    .string()
    .optional(),

  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      '❌  Invalid environment variables:\n',
      result.error.format(),
    );
    throw new Error('Missing or invalid environment variables — see errors above.');
  }

  return result.data;
}

/**
 * Validated, typed environment object.
 * Importing this module triggers validation at startup; the process will crash
 * immediately in production if required variables are missing.
 */
export const env = validateEnv();
