"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import React, { useEffect, useRef, useState } from "react";
import { THEMES } from "../_constants";
import { AnimatePresence, motion } from "framer-motion";
import { CircleOff, Cloud, Github, Laptop, Moon, Palette, Sun, ChevronDown } from "lucide-react";
import useMounted from "@/hooks/useMounted";

const THEME_ICONS: Record<string, React.ReactNode> = {
  "vs-dark": <Moon className="size-4" />, 
  "vs-light": <Sun className="size-4" />, 
  "github-dark": <Github className="size-4" />, 
  monokai: <Laptop className="size-4" />, 
  "solarized-dark": <Cloud className="size-4" />,
};

function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();
  const { theme, setTheme } = useCodeEditorStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEMES.find((t) => t.id === theme);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 

  if (!mounted) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-40 group relative flex items-center gap-2 px-4 py-2.5 bg-[#1e1e2e]/80 hover:bg-[#262637] 
        rounded-lg transition-all duration-200 border border-gray-800/50 hover:border-gray-700 text-sm"
      >
        <Palette className="size-4 text-gray-400 group-hover:text-gray-300 transition-colors" />

        <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors truncate">
          {currentTheme?.label}
        </span>

        <div
          className="w-4 h-4 rounded-full border border-gray-600 group-hover:border-gray-500 transition-colors"
          style={{ background: currentTheme?.color }}
        />

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`size-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-48 min-w-[220px] bg-[#1e1e2e]/95 
            backdrop-blur-xl rounded-lg border border-[#313244] shadow-lg py-2 z-50"
          >
            <div className="px-3 pb-1 border-b border-gray-800/50">
              <p className="text-xs font-semibold text-gray-400">Select Theme</p>
            </div>

            {THEMES.map((t) => (
              <motion.button
                key={t.id}
                className={`relative group w-full flex items-center gap-2 px-3 py-2 hover:bg-[#262637] transition-all duration-200
                ${theme === t.id ? "bg-blue-500/10 text-blue-400" : "text-gray-300"} text-sm`}
                onClick={() => setTheme(t.id)}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-md
                  ${theme === t.id ? "bg-blue-500/10 text-blue-400" : "bg-gray-800/50 text-gray-400"}
                  group-hover:scale-105 transition-all duration-200`}
                >
                  {THEME_ICONS[t.id] || <CircleOff className="size-4" />}
                </div>

                <span className="flex-1 text-left group-hover:text-white transition-colors truncate">
                  {t.label}
                </span>

                <div
                  className="w-4 h-4 rounded-full border border-gray-600 group-hover:border-gray-500 transition-colors"
                  style={{ background: t.color }}
                />

                {theme === t.id && (
                  <motion.div className="absolute inset-0 border border-blue-500/30 rounded-md" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeSelector;
