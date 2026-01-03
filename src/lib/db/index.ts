/**
 * Database client configuration for Neon Postgres with Drizzle ORM
 *
 * Uses HTTP adapter for serverless/edge compatibility (SvelteKit on Vercel)
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

// Create the Neon SQL client using HTTP (optimal for serverless)
const sql = neon(DATABASE_URL);

// Export the Drizzle database instance with schema for type-safe queries
export const db = drizzle({ client: sql, schema });

// Re-export sql for raw query needs
export { sql };

// Re-export schema for external use
export * from './schema';
