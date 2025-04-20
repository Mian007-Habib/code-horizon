import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


//“If this user isn’t in the database already, then save them as a new user with their name, email, and userId.”

export const syncUser = mutation({
    args:{
        userId: v.string(),
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("user").filter(q => q.eq(q.field("userId"), args.userId)).first();

        if(!existingUser){
            await ctx.db.insert("user", {
                userId: args.userId,
                email: args.email,
                name: args.name,
                isPro: false
            })
        }
    }
})

export const getUser = query({
    args: { userId: v.string() },
  
    handler: async (ctx, args) => {
      if (!args.userId) return null;
  
      const user = await ctx.db
        .query("user")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .first();
  
      if (!user) return null;
  
      return user;
    },
  });


  //This function upgrades a user to Pro after a successful payment via Lemon Squeezy.
  //Find the user using their email. If they exist, mark them as Pro and save their Lemon Squeezy info.
  //ctx.db.patch is used to modify or update certain fields of a record in the database without changing the entire record.
  export const upgradeToPro = mutation({
    args: {
      email: v.string(),
      lemonSqueezyCustomerId: v.string(),
      lemonSqueezyOrderId: v.string(),
      amount: v.number(),
    },
    handler: async (ctx, args) => {
      const user = await ctx.db
        .query("user")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
  
      if (!user) throw new Error("User not found");
  
      await ctx.db.patch(user._id, {
        isPro: true,
        proSince: Date.now(),
        lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
        lemonSqueezyOrderId: args.lemonSqueezyOrderId,
      });
  
      return { success: true };
    },
  });
  