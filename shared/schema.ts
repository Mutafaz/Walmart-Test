import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for auth purposes
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Receipt schema for storing receipt data
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  storeNumber: text("store_number").notNull(),
  storeAddress: text("store_address").notNull(),
  storeCity: text("store_city").notNull(),
  storeStateZip: text("store_state_zip").notNull(),
  storePhone: text("store_phone").notNull(),
  receiptDate: text("receipt_date").notNull(),
  cashier: text("cashier").notNull(),
  register: text("register").notNull(),
  taxRate: text("tax_rate").notNull(),
  paymentMethod: text("payment_method").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
});

// Receipt items schema for storing items on a receipt
export const receiptItems = pgTable("receipt_items", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").references(() => receipts.id).notNull(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  quantity: text("quantity").notNull(),
});

export const insertReceiptItemSchema = createInsertSchema(receiptItems).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;

export type InsertReceiptItem = z.infer<typeof insertReceiptItemSchema>;
export type ReceiptItem = typeof receiptItems.$inferSelect;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ReceiptItemSchema = z.object({
  id: z.string(),
  receiptId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ReceiptSchema = z.object({
  id: z.string(),
  userId: z.string(),
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
export const insertUserSchema = createInsertSchema(UserSchema);
export const insertReceiptSchema = createInsertSchema(ReceiptSchema);
export const insertReceiptItemSchema = createInsertSchema(ReceiptItemSchema);

// Create select schemas
export const selectUserSchema = createSelectSchema(UserSchema);
export const selectReceiptSchema = createSelectSchema(ReceiptSchema);
export const selectReceiptItemSchema = createSelectSchema(ReceiptItemSchema);
