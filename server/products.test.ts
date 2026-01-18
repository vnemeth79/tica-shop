import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("products", () => {
  it("should list all products", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    // Check first product structure
    if (products.length > 0) {
      const product = products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('emoji');
      expect(product).toHaveProperty('slogan');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('imageUrl');
    }
  });

  it("should get product by id", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getById({ id: 1 });

    expect(product).toBeDefined();
    if (product) {
      expect(product.id).toBe(1);
      expect(product.name).toBeDefined();
      expect(product.emoji).toBeDefined();
    }
  });
});

describe("orders", () => {
  it("should create an order", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const orderData = {
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "+506 1234 5678",
      shippingAddress: "Test Address, San José, Costa Rica",
      items: [
        {
          productId: 1,
          productName: "Coatí Guard",
          quantity: 10,
        },
      ],
      subtotal: 0,
      discount: 0,
      shippingCost: 10,
      total: 10,
      paymentMethod: "Revolut",
      notes: "Test order",
    };

    const result = await caller.orders.create(orderData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.orderId).toBeGreaterThan(0);
  });
});
