import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { pgTable, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';

// Database table definitions
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const receipts = pgTable('receipts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  storeName: text('store_name').notNull(),
  date: timestamp('date').notNull(),
  total: integer('total').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const receiptItems = pgTable('receipt_items', {
  id: serial('id').primaryKey(),
  receiptId: integer('receipt_id').references(() => receipts.id),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Zod schemas for validation
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ReceiptItemSchema = z.object({
  id: z.number(),
  receiptId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ReceiptSchema = z.object({
  id: z.number(),
  userId: z.number().nullable(),
  storeName: z.string(),
  date: z.date(),
  total: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Infer types from schemas
export type User = z.infer<typeof UserSchema>;
export type Receipt = z.infer<typeof ReceiptSchema>;
export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertReceiptSchema = createInsertSchema(receipts);
export const insertReceiptItemSchema = createInsertSchema(receiptItems);

// Create select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectReceiptSchema = createSelectSchema(receipts);
export const selectReceiptItemSchema = createSelectSchema(receiptItems);
