import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Paytm payment callback handler
http.route({
  path: "/payment/callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const formData = await request.formData();
      const paytmResponse: any = {};
      
      // Extract all form data
      formData.forEach((value, key) => {
        paytmResponse[key] = value.toString();
      });

      console.log("Paytm callback received:", paytmResponse);

      // Verify payment
      const verificationResult = await ctx.runAction(api.payments.verifyPaytmPayment, {
        paytmResponse,
      });

      // Redirect based on payment status
      const redirectUrl = verificationResult.success 
        ? `${process.env.SITE_URL || 'http://localhost:5173'}?payment=success&orderId=${paytmResponse.ORDERID}`
        : `${process.env.SITE_URL || 'http://localhost:5173'}?payment=failed&orderId=${paytmResponse.ORDERID}`;

      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    } catch (error) {
      console.error("Payment callback error:", error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${process.env.SITE_URL || 'http://localhost:5173'}?payment=error`,
        },
      });
    }
  }),
});

export default http;
