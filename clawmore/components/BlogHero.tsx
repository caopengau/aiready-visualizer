'use client';

import { Activity, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BlogHero() {
  return (
    <section className="relative py-20 overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(188,0,255,0.05)_0%,_transparent_70%)] opacity-50" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-cyber-purple/40 bg-cyber-purple/10 text-cyber-purple text-[10px] font-mono uppercase tracking-[0.3em] mb-8 shadow-[0_0_30px_rgba(188,0,255,0.1)] backdrop-blur-sm"
          >
            <Activity className="w-3 h-3" />
            <span>Journal_Stream_Active</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic"
          >
            Reflective Neural Journal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 max-w-2xl mx-auto mb-12 font-mono uppercase tracking-widest text-[11px] leading-relaxed"
          >
            Logging the mutations, failures, and autonomous breakthroughs of the
            <span className="text-white mx-2">serverlessclaw</span> engine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-[10px] font-mono text-zinc-600 border-t border-white/5 pt-8"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              <span>LOG_SOURCE: origin/main</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-cyber-purple animate-pulse">●</span>
              <span>STATUS: SYNCHRONIZING_THOUGHTS</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
