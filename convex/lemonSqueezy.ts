//This code is used to verify that a webhook from Lemon Squeezy is genuine — that it really came from them, and not someone pretending.
"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { createHmac } from "crypto";

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;



function verifySignature(payload: string, signature: string): boolean {
  const hmac = createHmac("sha256", webhookSecret);//Creates a secure hash generator using a secret only you and Lemon Squeezy know.
  const computedSignature = hmac.update(payload).digest("hex");// It "signs" the payload using your secret, and gives back the result.
  return signature === computedSignature;
}

export const verifyWebhook = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const isValid = verifySignature(args.payload, args.signature);

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    return JSON.parse(args.payload);
  },
});
