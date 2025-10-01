import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(32),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('Invalid environment variables:', envParsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = envParsed.data;