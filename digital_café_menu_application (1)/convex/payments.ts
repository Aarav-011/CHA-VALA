"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";
import { api } from "./_generated/api";

export const createPaytmOrder = action({
  args: {
    amount: v.number(),
    orderId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      if (!process.env.PAYTM_MERCHANT_ID || !process.env.PAYTM_MERCHANT_KEY) {
        throw new Error("Paytm not configured. Please set PAYTM_MERCHANT_ID and PAYTM_MERCHANT_KEY environment variables.");
      }

      const merchantId = process.env.PAYTM_MERCHANT_ID;
      const merchantKey = process.env.PAYTM_MERCHANT_KEY;
      const website = process.env.PAYTM_WEBSITE || "WEBSTAGING";
      const industryType = process.env.PAYTM_INDUSTRY_TYPE || "Retail";
      const channelId = process.env.PAYTM_CHANNEL_ID || "WEB";
      
      const paytmParams = {
        MID: merchantId,
        WEBSITE: website,
        INDUSTRY_TYPE_ID: industryType,
        CHANNEL_ID: channelId,
        ORDER_ID: args.orderId,
        CUST_ID: `CUST_${Date.now()}`,
        TXN_AMOUNT: args.amount.toString(),
        CALLBACK_URL: `${process.env.SITE_URL || 'http://localhost:5173'}/payment/callback`,
        EMAIL: args.customerEmail,
        MOBILE_NO: args.customerPhone,
      };

      // Generate checksum
      const checksum = generateChecksum(paytmParams, merchantKey);
      
      // Update order with Paytm order details
      await ctx.runMutation(api.orders.updatePaytmOrderId, {
        orderId: args.orderId,
        paytmOrderId: args.orderId,
      });

      return {
        orderId: args.orderId,
        merchantId,
        amount: args.amount,
        checksum,
        paytmParams,
        paymentUrl: process.env.PAYTM_PAYMENT_URL || "https://securegw-stage.paytm.in/order/process",
      };
    } catch (error) {
      console.error("Error creating Paytm order:", error);
      throw new Error("Failed to create payment order");
    }
  },
});

export const verifyPaytmPayment = action({
  args: {
    paytmResponse: v.object({
      ORDERID: v.string(),
      TXNID: v.string(),
      TXNAMOUNT: v.string(),
      STATUS: v.string(),
      RESPCODE: v.string(),
      RESPMSG: v.string(),
      CHECKSUMHASH: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      if (!process.env.PAYTM_MERCHANT_KEY) {
        throw new Error("Paytm not configured. Please set PAYTM_MERCHANT_KEY environment variable.");
      }

      const merchantKey = process.env.PAYTM_MERCHANT_KEY;
      const paytmResponse = args.paytmResponse;
      
      // Verify checksum
      const isValidChecksum = verifyChecksum(paytmResponse, merchantKey);

      if (isValidChecksum && paytmResponse.STATUS === "TXN_SUCCESS") {
        // Update payment status
        await ctx.runMutation(api.orders.updatePaymentStatus, {
          orderId: paytmResponse.ORDERID,
          paymentStatus: "completed",
          paytmPaymentId: paytmResponse.TXNID,
          paytmResponse: JSON.stringify(paytmResponse),
        });

        // Send confirmation notification
        await ctx.runAction(api.notifications.sendOrderConfirmation, {
          orderId: paytmResponse.ORDERID,
        });

        return { success: true, message: "Payment verified successfully" };
      } else {
        await ctx.runMutation(api.orders.updatePaymentStatus, {
          orderId: paytmResponse.ORDERID,
          paymentStatus: "failed",
        });
        return { success: false, message: "Payment verification failed" };
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw new Error("Payment verification failed");
    }
  },
});

// Utility functions for Paytm checksum generation and verification
function generateChecksum(params: Record<string, string>, merchantKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  let queryString = "";
  
  sortedKeys.forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
      queryString += `${key}=${params[key]}&`;
    }
  });
  
  queryString = queryString.slice(0, -1); // Remove last &
  
  const hash = crypto.createHash('sha256');
  hash.update(queryString + merchantKey);
  return hash.digest('hex');
}

function verifyChecksum(params: Record<string, string>, merchantKey: string): boolean {
  const receivedChecksum = params.CHECKSUMHASH;
  delete params.CHECKSUMHASH;
  
  const generatedChecksum = generateChecksum(params, merchantKey);
  return receivedChecksum === generatedChecksum;
}
