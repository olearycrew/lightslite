/**
 * Database schema definitions for LightsLite
 *
 * Defines all tables using Drizzle ORM for Neon Postgres
 */
import { pgTable, uuid, text, varchar, timestamp, jsonb, integer, real } from 'drizzle-orm/pg-core';

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

/**
 * Hanging positions table - stores pipes, trusses, booms, etc.
 */
export const hangingPositions = pgTable('hanging_positions', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 50 }).notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	geometry: jsonb('geometry').notNull(),
	trimHeight: real('trim_height'),
	loadCapacity: real('load_capacity'),
	circuitCount: integer('circuit_count'),
	notes: text('notes'),
	sortOrder: integer('sort_order').notNull().default(0)
});

/**
 * Instruments table - stores lighting fixtures/instruments
 */
export const instruments = pgTable('instruments', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	hangingPositionId: uuid('hanging_position_id').references(() => hangingPositions.id, {
		onDelete: 'set null'
	}),
	type: varchar('type', { length: 100 }).notNull(),
	positionX: real('position_x').notNull(),
	positionY: real('position_y').notNull(),
	rotation: real('rotation').notNull().default(0),
	channel: integer('channel'),
	dimmer: varchar('dimmer', { length: 50 }),
	circuit: varchar('circuit', { length: 50 }),
	universe: integer('universe'),
	address: integer('address'),
	color: varchar('color', { length: 100 }),
	gobo: varchar('gobo', { length: 100 }),
	template: varchar('template', { length: 100 }),
	accessory: varchar('accessory', { length: 100 }),
	unitNumber: integer('unit_number'),
	purpose: varchar('purpose', { length: 255 }),
	notes: text('notes'),
	labelDisplay: jsonb('label_display')
});

/**
 * Set pieces table - stores scenic elements
 */
export const setPieces = pgTable('set_pieces', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	type: varchar('type', { length: 50 }).notNull(),
	geometry: jsonb('geometry').notNull(),
	fill: varchar('fill', { length: 50 }),
	stroke: varchar('stroke', { length: 50 }),
	layer: varchar('layer', { length: 100 }),
	notes: text('notes')
});

/**
 * Annotations table - stores text labels, dimensions, arrows, etc.
 */
export const annotations = pgTable('annotations', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 50 }).notNull(),
	geometry: jsonb('geometry').notNull(),
	text: varchar('text', { length: 1000 }),
	style: jsonb('style'),
	layer: varchar('layer', { length: 100 })
});

/**
 * Project history table - stores snapshots for undo/redo and versioning
 */
export const projectHistory = pgTable('project_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	stateSnapshot: jsonb('state_snapshot').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Type exports for use with Drizzle
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type HangingPosition = typeof hangingPositions.$inferSelect;
export type NewHangingPosition = typeof hangingPositions.$inferInsert;

export type Instrument = typeof instruments.$inferSelect;
export type NewInstrument = typeof instruments.$inferInsert;

export type SetPiece = typeof setPieces.$inferSelect;
export type NewSetPiece = typeof setPieces.$inferInsert;

export type Annotation = typeof annotations.$inferSelect;
export type NewAnnotation = typeof annotations.$inferInsert;

export type ProjectHistory = typeof projectHistory.$inferSelect;
export type NewProjectHistory = typeof projectHistory.$inferInsert;
