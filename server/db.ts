import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, products, orders, orderItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Connecting to database...");
      _client = postgres(process.env.DATABASE_URL, {
        ssl: 'require',
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      _db = drizzle(_client);
      console.log("[Database] Connection established");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL uses onConflictDoUpdate instead of onDuplicateKeyUpdate
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Products
export async function getAllProducts() {
  const db = await getDb();
  if (!db) {
    console.error("[Database] Cannot get products: database not available");
    return [];
  }
  try {
    console.log("[Database] Fetching products...");
    const result = await db.select().from(products).where(eq(products.isActive, 1));
    console.log(`[Database] Found ${result.length} products`);
    return result;
  } catch (error) {
    console.error("[Database] Error fetching products:", error);
    throw error;
  }
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Orders
export async function createOrder(input: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: Array<{ productId: number; productName: string; quantity: number }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // PostgreSQL uses RETURNING instead of $returningId()
  const orderResult = await db.insert(orders).values({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone || null,
    shippingAddress: input.shippingAddress,
    subtotal: input.subtotal.toFixed(2),
    discount: input.discount.toFixed(2),
    shippingCost: input.shippingCost.toFixed(2),
    total: input.total.toFixed(2),
    status: 'pending',
    paymentMethod: input.paymentMethod,
    notes: input.notes || null,
  }).returning({ id: orders.id });

  const orderId = orderResult[0]?.id;
  if (!orderId) throw new Error('Failed to create order');

  for (const item of input.items) {
    await db.insert(orderItems).values({
      orderId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: '0.00',
      subtotal: '0.00',
    });
  }

  return orderId;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(orders);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (orderResult.length === 0) return undefined;
  
  const itemsResult = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  
  return {
    order: orderResult[0],
    items: itemsResult,
  };
}
