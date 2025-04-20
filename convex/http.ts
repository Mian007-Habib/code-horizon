import { httpRouter } from "convex/server"  //httpRouter lets Convex receive messages from outside services like Clerk.
import { httpAction } from "./_generated/server" //httpAction is how you tell Convex what to do when someone knocks on your door.
import { Webhook } from "svix";//svix is a library for verifying webhooks from Clerk.
import { WebhookEvent } from "@clerk/nextjs/server";//WebhookEvent describes the shape of the message Clerk sends you.
import{api, internal} from "./_generated/api";//You’re telling Convex: "Let me call my own server functions from this file."


const http = httpRouter();

//Convex, I want to listen for a POST request on this path: /lemon-squeezy-webhook.
//When someone hits this URL (like Lemon Squeezy), I want to check their signature to make sure it’s really from them, and then process the message."
//This is like opening the door for Lemon Squeezy and saying, "Okay, come in! But first, show me your ID!"
//If the ID is good, you let them in and do something with the message they brought you.

http.route({
    path: "/lemon-squeezy-webhook",
    method: "POST",
    handler: httpAction(async(ctx,request) => {
        const payloadString = await request.text();
        const signature = request.headers.get("X-Signature");

        if(!signature){
            return new Response("Error occurred- missing signature", { status: 400 });
        }

        try{
            const payload = await ctx.runAction(internal.lemonSqueezy.verifyWebhook,{
                payload: payloadString,
                signature
            })


            if (payload.meta.event_name === "order_created") {
                const { data } = payload;
        
                const { success } = await ctx.runMutation(api.users.upgradeToPro, {
                  email: data.attributes.user_email,
                  lemonSqueezyCustomerId: data.attributes.customer_id.toString(),
                  lemonSqueezyOrderId: data.id,
                  amount: data.attributes.total,
                });
        
                if (success) {
                  // optionally do anything here
                }
              }
        
              return new Response("Webhook processed successfully", { status: 200 });

        }catch(error){
            console.log("Webhook error:", error);
      return new Response("Error processing webhook", { status: 500 });
        }
    })
})

http.route({
    path: "/clerk-webhook",
    method: "POST",

    handler: httpAction(async(ctx,request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if(!webhookSecret){
            throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
        }
        
        //This part is checking the identity of the postman (Clerk) before accepting the message (webhook).
        const svix_id = request.headers.get("svix-id");
        const svix_timestamp = request.headers.get("svix-timestamp");
        const svix_signature = request.headers.get("svix-signature");

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return new Response("Error occurred- missing svix headers", { status: 400 });
        }


        const payload = await request.json(); //Clerk knocks on your door and gives you a message (a JSON object).
        const body = JSON.stringify(payload); //You take the message and turn it into plain text with JSON.stringify.

        //You create a special verifier tool 🔐 using the webhookSecret.This will help check if the message is really from Clerk.
        const wh = new Webhook(webhookSecret); 
        let evt: WebhookEvent;

        //You use the verifier tool to check if the message is really from Clerk. If it is, you get a special event object back.
        //If it’s not, you get an error. You catch that error and log it to the console.
        //If everything is good, you can use the event object to do something with the message.
        try{
            evt = wh.verify(body,{
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as WebhookEvent;
        } catch (error) {
            console.error("Error verifying webhook", error);
            return new Response("Error occurred- Webhook verification failed", { status: 400 });
        }

        //This code is handling a webhook from Clerk — specifically when a new user is created.
        const eventType = evt.type;
        if(eventType === "user.created"){
          // save user to convex db
            const {id, email_addresses, first_name, last_name} = evt.data; //You’re getting the user’s ID, email addresses, first name, and last name from the event data.
            //You’re checking if the user has any email addresses. If they do, you take the first one. If not, you log an error and return a 400 response.

            const email = email_addresses[0].email_address;
            const name = `${first_name} ${last_name}`.trim();
        //You call a function (syncUser) that will save the new user in your database.
            try {
             await ctx.runMutation(api.users.syncUser,
                {userId:id,email,name});
            } catch (error) {
                console.log("Error Creating the user", error)
                return new Response("Error creating user",{status:500});
            }

        } 

        return new Response("Webhook processed successfully", { status: 200 });
    }),
});

export default http;