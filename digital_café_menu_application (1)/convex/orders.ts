import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
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
    gstAmount: v.optional(v.number()),
    netAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate GST (18% for restaurant services in India)
    const gstRate = 0.18;
    const netAmount = args.totalAmount / (1 + gstRate);
    const gstAmount = args.totalAmount - netAmount;
    
    const order = await ctx.db.insert("orders", {
      orderId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      tableNumber: args.tableNumber,
      orderType: args.orderType,
      items: args.items,
      totalAmount: args.totalAmount,
      netAmount: Math.round(netAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      status: "pending",
      paymentStatus: "pending",
    });

    return { orderId, id: order };
  },
});

export const getOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.find(order => order.orderId === args.orderId);
  },
});

export const updatePaymentStatus = mutation({
  args: {
    orderId: v.string(),
    paymentStatus: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    paytmPaymentId: v.optional(v.string()),
    paytmResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    const order = orders.find(o => o.orderId === args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    const updateData: any = {
      paymentStatus: args.paymentStatus,
      status: args.paymentStatus === "completed" ? "confirmed" : "pending",
    };

    if (args.paytmPaymentId) {
      updateData.paytmPaymentId = args.paytmPaymentId;
    }
    if (args.paytmResponse) {
      updateData.paytmResponse = args.paytmResponse;
    }

    await ctx.db.patch(order._id, updateData);
    return "Payment status updated";
  },
});

export const updatePaytmOrderId = mutation({
  args: {
    orderId: v.string(),
    paytmOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    const order = orders.find(o => o.orderId === args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(order._id, {
      paytmOrderId: args.paytmOrderId,
    });

    return "Paytm order ID updated";
  },
});

// Admin functions
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const getOrdersByStatus = query({
  args: { 
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").collect();
    const order = orders.find(o => o.orderId === args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(order._id, {
      status: args.status,
    });

    return "Order status updated";
  },
});

export const getOrderStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayOrders = orders.filter(order => order._creationTime >= todayTimestamp);
    const completedOrders = orders.filter(order => order.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalGST = completedOrders.reduce((sum, order) => sum + (order.gstAmount || 0), 0);
    const todayRevenue = todayOrders
      .filter(order => order.status === "completed")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const todayGST = todayOrders
      .filter(order => order.status === "completed")
      .reduce((sum, order) => sum + (order.gstAmount || 0), 0);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: orders.filter(order => order.status !== "completed").length,
      totalRevenue,
      totalGST,
      todayRevenue,
      todayGST,
    };
  },
});
