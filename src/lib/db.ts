import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/../drizzle/schema';

// Database connection configuration
const connectionString = process.env.DATABASE_URL!;

// Create postgres client
const client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for Next.js
  max: 1, // Single connection for serverless
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export types for convenience
export type Database = typeof db;
