import express from 'express';
import { z } from 'zod';
import { createServer, type Server } from "http";
import * as storage from "./storage";
import { ReceiptSchema, ReceiptItemSchema, UserSchema } from '@shared/schema';
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const router = express.Router();

// Product info type
interface ProductInfo {
  name: string;
  price: string;
}

// Parse product name from URL
function parseProductFromUrl(url: string): ProductInfo {
  try {
    // Extract product name from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const productName = lastPart
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return {
      name: productName,
      price: "0.00"
    };
  } catch (error) {
    console.error("Error parsing product URL:", error);
    throw new Error("Failed to parse product URL");
  }
}

// Validate request body schema
const fetchProductSchema = z.object({
  url: z.string().url()
});

// Product fetching endpoint
router.post('/fetch-product', async (_req, res) => {
  try {
    // Validate request body
    const { url } = fetchProductSchema.parse(_req.body);

    // Parse product info from URL
    const productInfo = parseProductFromUrl(url);

    // Return product info
    res.json(productInfo);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to fetch product information"
    });
  }
});

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Add CORS middleware
  app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // API Routes for receipts
  
  // Get all receipts
  app.get("/api/receipts", async (_req: express.Request, res: express.Response) => {
    try {
      const receipts = await storage.getAllReceipts();
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  // Get a receipt by ID
  app.get("/api/receipts/:id", async (_req: express.Request, res: express.Response) => {
    try {
      const id = parseInt(_req.params.id);
      const receipt = await storage.getReceiptById(id);
      
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      res.json(receipt);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      res.status(500).json({ message: "Failed to fetch receipt" });
    }
  });

  // Create a new receipt
  app.post("/api/receipts", async (req, res) => {
    try {
      // Validate receipt data
      const receiptData = ReceiptSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      
      // Create receipt
      const receipt = await storage.createReceipt(receiptData);
      
      res.status(201).json(receipt);
    } catch (error) {
      console.error("Error creating receipt:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create receipt" });
    }
  });

  // Create receipt items for a receipt
  app.post("/api/receipts/:receiptId/items", async (req: express.Request, res: express.Response) => {
    try {
      const receiptId = parseInt(req.params.receiptId);
      
      // Check if receipt exists
      const receipt = await storage.getReceiptById(receiptId);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      // Validate and create items
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const createdItems = [];
      
      for (const item of items) {
        const itemData = ReceiptItemSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse({
          ...item,
          receiptId
        });
        
        const createdItem = await storage.createReceiptItem(itemData);
        createdItems.push(createdItem);
      }
      
      res.status(201).json(createdItems);
    } catch (error) {
      console.error("Error creating receipt items:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create receipt items" });
    }
  });

  // Generate PDF route
  app.post("/api/generate-pdf", (_req: express.Request, res: express.Response) => {
    // In a production environment, this would use a PDF generation library
    // and return a PDF buffer or URL, but we're handling this client-side
    // with html2canvas and jsPDF for this implementation
    res.json({ message: "PDF generation handled client-side" });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userData = UserSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(user);
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Receipt routes
  app.get('/api/users/:userId/receipts', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const receipts = await storage.getReceiptsByUserId(userId);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Receipt item routes
  app.post('/api/receipt-items', async (req, res) => {
    try {
      const itemData = ReceiptItemSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(req.body);
      const item = await storage.createReceiptItem(itemData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.get('/api/receipts/:receiptId/items', async (req, res) => {
    try {
      const receiptId = parseInt(req.params.receiptId);
      const items = await storage.getReceiptItemsByReceiptId(receiptId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/receipt-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReceiptItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

export default router;

