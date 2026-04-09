import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  ENABLE_SYNTHETIC_DATA: z
    .enum(["true", "false"])
    .default("false")
    .transform((v: "true" | "false") => v === "true"),
  ALLOW_PRODUCTION_INSIGHTS_FROM_REAL_ONLY: z
    .enum(["true", "false"])
    .default("true")
    .transform((v: "true" | "false") => v === "true"),
  ENABLE_CHALLENGES: z.enum(["true", "false"]).default("true").transform((v: "true" | "false") => v === "true"),
  ENABLE_PROTOCOL_EVOLUTION: z
    .enum(["true", "false"])
    .default("false")
    .transform((v: "true" | "false") => v === "true"),
  ENABLE_SOCIAL_LAYER: z.enum(["true", "false"]).default("false").transform((v: "true" | "false") => v === "true"),
  ENABLE_GEOSPATIAL_COLLECTION: z
    .enum(["true", "false"])
    .default("false")
    .transform((v: "true" | "false") => v === "true"),
  ENABLE_PREMIUM_FEATURES: z.enum(["true", "false"]).default("false").transform((v: "true" | "false") => v === "true"),
  ENABLE_PRACTITIONER_TOOLS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v: "true" | "false") => v === "true"),
  ENABLE_RESEARCH_EXPORTS: z.enum(["true", "false"]).default("false").transform((v: "true" | "false") => v === "true"),
  ENABLE_EXTERNAL_HEALTH_INTEGRATIONS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v: "true" | "false") => v === "true"),
  ENABLE_REPUTATION_WEIGHTING: z
    .enum(["true", "false"])
    .default("true")
    .transform((v: "true" | "false") => v === "true"),
  MIN_REGION_SAMPLE_SIZE: z.coerce.number().default(30),
  MIN_ADHERENCE_FOR_VALID_RUN: z.coerce.number().default(50),
  FULL_WEIGHT_ADHERENCE_THRESHOLD: z.coerce.number().default(70),
  REPUTATION_FULL_WEIGHT_THRESHOLD: z.coerce.number().default(0.8),
  REPUTATION_STANDARD_WEIGHT_THRESHOLD: z.coerce.number().default(0.6),
  REPUTATION_DOWN_WEIGHT_THRESHOLD: z.coerce.number().default(0.4),
  REPUTATION_FULL_WEIGHT: z.coerce.number().default(1.2),
  REPUTATION_STANDARD_WEIGHT: z.coerce.number().default(1),
  REPUTATION_DOWN_WEIGHT: z.coerce.number().default(0.8),
  REPUTATION_MIN_WEIGHT: z.coerce.number().default(0.5),
  PRIVACY_MODE_STRICT: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
  LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO"),
  PORT: z.coerce.number().default(3000),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Environment validation failed", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
