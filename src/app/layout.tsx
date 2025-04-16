import type { Metadata } from "next";         //metadata object follows the correct type structure for SEO metadata in a Next.js app.
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";  //access to a Convex database.
import Footer from "@/components/Footer";
import {Toaster} from "react-hot-toast";







const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code-Horizon",
  description: "Share and run code snippets with others",
};

export default function RootLayout({
  children,  // Represents the content inside this layout. Wraps all the pages inside the layout
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col`}>
          <ConvexClientProvider>{children}</ConvexClientProvider>  {/* Ensures that all components inside can interact with Convex*/}
          <Toaster />
          <Footer/>
       
      </body>
    </html>

</ClerkProvider>
  );
}
