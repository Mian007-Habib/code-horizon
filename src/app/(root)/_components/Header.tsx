import { currentUser } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Blocks, Code2, Sparkles } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import RunButton from "./RunButton";
import HeaderProfileBtn from "./HeaderProfileBtn";

async function Header() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const user = await currentUser();

  const convexUser = await convex.query(api.users.getUser, {
    userId: user?.id || "",
  });

  console.log({ convexUser });

  return (
    <div className="relative z-50 bg-black/90 backdrop-blur-xl p-4">
    <div className="flex items-center justify-between rounded-lg">
      {/* Left Section: Logo & Snippets Button */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 relative group">
          {/* Hover Effect Inside the Logo Container */}
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl pointer-events-none" />

          {/* Logo */}
          <div
            className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 
          ring-white/10 group-hover:ring-white/20 transition-all"
          >
            <Blocks className="size-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          {/* Text with Hover Effect */}
          <div className="flex flex-col relative">
            <span className="block text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500">
              CodeHorizon
            </span>
            <span className="block text-xs text-blue-400/60 font-medium">
              Interactive Code Editor
            </span>
          </div>
        </Link>

        {/* Snippets Button */}
        <nav>
          <Link
            href="/snippets"
            className="relative group flex items-center gap-2 px-3 py-1 rounded-md text-gray-300 bg-gray-800/30 
            hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-md overflow-hidden text-sm"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 
            to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Code2 className="w-3.5 h-3.5 relative z-10 group-hover:rotate-3 transition-transform" />
            <span className="font-medium relative z-10 group-hover:text-white transition-colors">
              Snippets
            </span>
          </Link>
        </nav>
      </div>

      {/* Right Section: Theme, Language, Pro, Run, Profile */}
      <div className="flex items-center gap-4">
        {/* Theme & Language Selectors */}
        <div className="flex items-center gap-3">
          <ThemeSelector />
          {convexUser && (
            <LanguageSelector hasAccess={Boolean(convexUser?.isPro)} />
          )}
        </div>

        {/* Pro Upgrade Button (if not Pro) */}
        {!convexUser?.isPro && (
          <Link
            href="/pricing"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
            to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 
            transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-amber-400 hover:text-amber-300" />
            <span className="text-sm font-medium text-amber-400/90 hover:text-amber-300">
              Pro
            </span>
          </Link>
        )}

        {/* Run Button (Only Visible if Signed In) */}
        <SignedIn>
          <RunButton />
        </SignedIn>

        {/* Profile Button */}
        <div className="pl-3 border-l border-gray-800">
          <HeaderProfileBtn />
        </div>
      </div>
    </div>
  </div>
  );
}

export default Header;
