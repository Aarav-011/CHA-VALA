import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const initializeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists
    const existingAdmin = await ctx.db.query("adminUsers").take(1);
    if (existingAdmin.length > 0) {
      return "Admin already initialized";
    }

    // Create default admin user
    await ctx.db.insert("adminUsers", {
      email: "admin@aarav.com",
      name: "Admin User",
      role: "admin",
      isActive: true,
    });

    return "Admin user created successfully";
  },
});

export const checkAdminAccess = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return adminUser && adminUser.isActive ? adminUser : null;
  },
});

export const createAdminUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const adminUser = await ctx.db.insert("adminUsers", {
      email: args.email,
      name: args.name,
      role: args.role,
      isActive: true,
    });

    return adminUser;
  },
});
