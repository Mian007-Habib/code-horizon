import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


 //✅ You’re securing your app with Clerk's middleware.

 //🛡️ It checks auth before letting users access protected routes.

 //⚙️ The matcher avoids unnecessary routes and speeds things up.

 // Clerk will only run on actual pages and API routes, not your static assets.

 //✅ It handles authentication, authorization, and rate limiting.

 //🛡️ It protects your app from unauthenticated users.

 //⚙️ It avoids unnecessary work. 	Skips CSS, JS, images, etc. — because they don’t need auth.
