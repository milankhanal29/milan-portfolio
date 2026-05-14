"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/suggestions", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(243,75%,59%)] to-[hsl(280,75%,60%)] flex items-center justify-center text-white font-bold text-sm">
              MK
            </div>
            <span className="font-semibold text-lg hidden sm:block">Milan Khanal</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "text-[hsl(var(--primary-foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                {pathname === item.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-[hsl(var(--primary))] rounded-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Theme toggle + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--secondary))]"
              aria-label="Toggle menu"
            >
              <div className="space-y-1.5">
                <span className={cn("block w-5 h-0.5 bg-current transition-all", mobileOpen && "rotate-45 translate-y-2")} />
                <span className={cn("block w-5 h-0.5 bg-current transition-all", mobileOpen && "opacity-0")} />
                <span className={cn("block w-5 h-0.5 bg-current transition-all", mobileOpen && "-rotate-45 -translate-y-2")} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            © {new Date().getFullYear()} Milan Khanal. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/milankhanal29" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors text-sm">
              GitHub
            </a>
            <a href="https://linkedin.com/in/milankhanal29" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors text-sm">
              LinkedIn
            </a>
            <a href="mailto:hello@khanalmilan.com.np" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors text-sm">
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
