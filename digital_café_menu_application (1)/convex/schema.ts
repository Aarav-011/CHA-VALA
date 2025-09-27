import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  orders: defineTable({
    orderId: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    tableNumber: v.number(),
    orderType: v.union(v.literal("dine-in"), v.literal("takeaway")),
    items: v.array(v.object({
      id: v.string(),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    totalAmount: v.number(),
    netAmount: v.optional(v.number()),
    gstAmount: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed")
    ),
    paymentStatus: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    paymentId: v.optional(v.string()),
    paytmOrderId: v.optional(v.string()),
    paytmPaymentId: v.optional(v.string()),
    paytmResponse: v.optional(v.string()),
  }).index("by_table", ["tableNumber"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_order_id", ["orderId"]),

  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    available: v.boolean(),
  }).index("by_category", ["category"]),

  adminUsers: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
