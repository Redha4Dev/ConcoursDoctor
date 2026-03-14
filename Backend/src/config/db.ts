// src/config/db.ts
import "dotenv/config"; // Ensure environment variables are loaded
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient as IdentityClient } from "../generated/identity/client.js";
import { PrismaClient as CorrectionClient } from "../generated/correction/client.js";

// In Prisma 7, we pass the config object directly to PrismaNeon.
// This avoids the 'Pool' vs 'PoolConfig' type mismatch.

const identityAdapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const correctionAdapter = new PrismaNeon({
  connectionString: process.env.CORRECTION_DB_URL,
});

export const identityDb = new IdentityClient({ adapter: identityAdapter });
export const correctionDb = new CorrectionClient({
  adapter: correctionAdapter,
});
