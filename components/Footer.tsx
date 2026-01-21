"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const links = [
  { href: "https://www.npmjs.com/package/@aiready/cli", label: "NPM" },
  { href: "https://github.com/caopengau/aiready-cli", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-6 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="text-center md:text-left">
            <div className="text-xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-1">
              aiready
            </div>
            <div className="text-sm text-slate-600">
              © 2025 aiready. Open source under MIT License.
            </div>
          </div>
          <div className="flex gap-6">
            {links.map((link, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
