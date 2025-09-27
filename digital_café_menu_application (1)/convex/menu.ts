import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMenuItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").collect();
  },
});

export const getMenuByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const initializeMenu = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if menu already exists
    const existingItems = await ctx.db.query("menuItems").take(1);
    if (existingItems.length > 0) {
      return "Menu already initialized";
    }

    const menuItems = [
      // Coffee
      {
        name: "Espresso",
        description: "Rich and bold single shot of premium coffee",
        price: 120,
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Cappuccino",
        description: "Perfect blend of espresso, steamed milk, and foam",
        price: 180,
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Latte",
        description: "Smooth espresso with steamed milk and light foam",
        price: 200,
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Americano",
        description: "Espresso shots with hot water for a clean taste",
        price: 150,
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=200&fit=crop",
        available: true,
      },

      // Tea
      {
        name: "Masala Chai",
        description: "Traditional Indian spiced tea with milk",
        price: 80,
        category: "Tea",
        image: "https://images.unsplash.com/photo-1597318181409-cf64d0b3fd34?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Green Tea",
        description: "Refreshing antioxidant-rich green tea",
        price: 100,
        category: "Tea",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Earl Grey",
        description: "Classic black tea with bergamot essence",
        price: 120,
        category: "Tea",
        image: "https://images.unsplash.com/photo-1594631661960-0e4c8d0e3d66?w=300&h=200&fit=crop",
        available: true,
      },

      // Cold Beverages
      {
        name: "Iced Coffee",
        description: "Chilled coffee with ice and milk",
        price: 160,
        category: "Cold Beverages",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Fresh Lime Soda",
        description: "Refreshing lime with soda and mint",
        price: 90,
        category: "Cold Beverages",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Mango Smoothie",
        description: "Creamy mango smoothie with yogurt",
        price: 180,
        category: "Cold Beverages",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop",
        available: true,
      },

      // Pastries
      {
        name: "Croissant",
        description: "Buttery, flaky French pastry",
        price: 120,
        category: "Pastries",
        image: "https://images.unsplash.com/photo-1555507036-ab794f4afe5a?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Chocolate Muffin",
        description: "Rich chocolate muffin with chocolate chips",
        price: 140,
        category: "Pastries",
        image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Blueberry Scone",
        description: "Fresh blueberry scone with cream",
        price: 160,
        category: "Pastries",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop",
        available: true,
      },

      // Sandwiches
      {
        name: "Club Sandwich",
        description: "Triple-layer sandwich with chicken, bacon, and veggies",
        price: 280,
        category: "Sandwiches",
        image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Grilled Cheese",
        description: "Classic grilled cheese with tomato",
        price: 180,
        category: "Sandwiches",
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Veggie Wrap",
        description: "Fresh vegetables wrapped in tortilla",
        price: 220,
        category: "Sandwiches",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
        available: true,
      },

      // Desserts
      {
        name: "Chocolate Cake",
        description: "Rich chocolate cake with ganache",
        price: 200,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Cheesecake",
        description: "Creamy New York style cheesecake",
        price: 220,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&h=200&fit=crop",
        available: true,
      },
      {
        name: "Tiramisu",
        description: "Classic Italian coffee-flavored dessert",
        price: 250,
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop",
        available: true,
      },
			{
	    name: "Dry Bhakhari (Methi Masala, Jeera) (2 pcs)",
	    description: "Crispy dry bhakhari with methi masala and jeera flavors",
	    price: 25,
	    category: "NASTA",
	    image: "https://via.placeholder.com/300x200",
	    available: true,
	  },
    ];

    for (const item of menuItems) {
      await ctx.db.insert("menuItems", item);
    }

    return "Menu initialized successfully";
  },
});
