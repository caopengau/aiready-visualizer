"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-slate-200/50 shadow-sm"
    >
      <nav className="container mx-auto px-4 py-2 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Image 
            src="/logo-text.png" 
            alt="AIReady Logo" 
            width={210} 
            height={48}
            className="h-8 sm:h-10 md:h-12 w-auto"
            priority
          />
        </motion.div>
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
          <Link 
            href="/docs"
            className="hidden sm:block text-sm md:text-base font-medium text-slate-600 hover:text-slate-900 relative group transition-colors"
          >
            <span>Docs</span>
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link 
            href="https://www.npmjs.com/package/@aiready/cli" 
            target="_blank"
            className="hidden sm:block text-sm md:text-base font-medium text-slate-600 hover:text-slate-900 relative group transition-colors"
          >
            <span>NPM</span>
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="#get-started"
              className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm sm:text-base font-bold rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>
    </motion.header>
  );
}
