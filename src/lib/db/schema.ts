/**
 * Database schema definitions for LightsLite
 *
 * Defines all tables using Drizzle ORM for Neon Postgres
 *
 * Note: Project data (instruments, hanging positions, set pieces, annotations)
 * is stored in the projects.layers JSONB column, not in separate normalized tables.
 * This approach simplifies:
 * - Project-centric operations (load/save entire plots)
 * - Undo/redo (snapshot entire state)
 * - Offline sync (one blob vs multi-table transactions)
 */
import { pgTable, uuid, varchar, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

/**
 * Users table - stores user account information
 */
export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

/**
 * Projects table - stores lighting plot projects
 *
 * The `layers` JSONB column contains all project data:
 * - shapes: Drawing shapes (rectangles, circles, lines)
 * - hangingPositions: Electrics, trusses, booms, ladders
 * - instruments: Lighting fixtures
 * - setPieces: Scenic elements
 * - annotations: Text labels, dimensions, notes
 */
export const projects = pgTable('projects', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	venue: jsonb('venue'),
	scale: jsonb('scale'),
	layers: jsonb('layers'),
	metadata: jsonb('metadata'),
	version: integer('version').notNull().default(1),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

// Type exports for use with Drizzle
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
