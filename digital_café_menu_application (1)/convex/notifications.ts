import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const sendOrderConfirmation = action({
  args: {
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const order = await ctx.runQuery(api.orders.getOrder, {
        orderId: args.orderId,
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // For now, we'll just log the confirmation
      // In production, you would integrate with an email service
      console.log(`Order confirmation for ${order.orderId}:`, {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        tableNumber: order.tableNumber,
        totalAmount: order.totalAmount,
        items: order.items,
      });

      return { 
        success: true, 
        message: "Order confirmation logged (email service not configured)" 
      };
    } catch (error) {
      console.error('Error processing order confirmation:', error);
      return { 
        success: false, 
        message: "Failed to process order confirmation" 
      };
    }
  },
});
