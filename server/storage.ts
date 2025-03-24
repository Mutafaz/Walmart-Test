import { nanoid } from 'nanoid';
import { Receipt, ReceiptItem, User } from '@shared/schema';

// In-memory storage
const _users: User[] = [];
const _receipts: Receipt[] = [];
const _receiptItems: ReceiptItem[] = [];

// User operations
export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const user: User = {
    ...data,
    id: parseInt(nanoid()),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  _users.push(user);
  return user;
}

export async function getUserById(id: number): Promise<User | undefined> {
  return _users.find(user => user.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return _users.find(user => user.email === email);
}

// Receipt operations
export async function createReceipt(data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt> {
  const receipt: Receipt = {
    ...data,
    id: parseInt(nanoid()),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  _receipts.push(receipt);
  return receipt;
}

export async function getReceiptById(id: number): Promise<Receipt | undefined> {
  return _receipts.find(receipt => receipt.id === id);
}

export async function getAllReceipts(): Promise<Receipt[]> {
  return _receipts;
}

export async function getReceiptsByUserId(userId: number): Promise<Receipt[]> {
  return _receipts.filter(receipt => receipt.userId === userId);
}

// Receipt item operations
export async function createReceiptItem(data: Omit<ReceiptItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReceiptItem> {
  const item: ReceiptItem = {
    ...data,
    id: parseInt(nanoid()),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  _receiptItems.push(item);
  return item;
}

export async function getReceiptItemsByReceiptId(receiptId: number): Promise<ReceiptItem[]> {
  return _receiptItems.filter(item => item.receiptId === receiptId);
}

export async function deleteReceiptItem(id: number): Promise<void> {
  const index = _receiptItems.findIndex(item => item.id === id);
  if (index !== -1) {
    _receiptItems.splice(index, 1);
  }
}
