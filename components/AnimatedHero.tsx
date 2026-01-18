"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const words = ["AI-Ready", "Optimized", "Consistent", "Efficient"];

export default function AnimatedHero() {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    initial: { opacity: 1 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { y: 0, opacity: 1 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="max-w-5xl mx-auto text-center relative"
    >
      {/* Badge */}
      <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200 shadow-lg">
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🚀
        </motion.span>
        <span>Open Source & Free Forever</span>
      </motion.div>

      {/* Main heading */}
      <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
        Make Your Codebase{" "}
        <br />
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, rotateX: 90 }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent"
        >
          {words[currentWord]}
        </motion.span>
      </motion.h1>

      {/* Description */}
      <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
        <span className="font-semibold text-slate-900">Your AI tools aren't broken. Your codebase confuses them.</span>
        <br />
        See why Copilot struggles and where small changes unlock outsized AI leverage—in 5 minutes.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <motion.a
          href="#get-started"
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-xl inline-flex items-center justify-center gap-2 group"
        >
          Get Started Free
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </motion.a>
        <motion.a
          href="https://www.npmjs.com/package/@aiready/cli"
          target="_blank"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border-2 border-slate-200 shadow-lg inline-flex items-center justify-center gap-2 hover:border-slate-300"
        >
          <span>📦</span>
          View on npm
        </motion.a>
      </motion.div>

      {/* Terminal Preview */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="bg-slate-900 rounded-2xl p-6 text-left max-w-3xl mx-auto border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Terminal dots */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-sm text-slate-500 font-mono">terminal</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono">$</span>
            <motion.code
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              transition={{ duration: 2, delay: 1 }}
              className="text-cyan-400 font-mono text-sm md:text-base overflow-hidden whitespace-nowrap"
            >
              npx @aiready/cli scan .
            </motion.code>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-cyan-400"
            >
              |
            </motion.span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-slate-400 text-xs md:text-sm font-mono space-y-1 pl-4"
          >
            <div>✓ Analyzing codebase...</div>
            <div>✓ Found 42 semantic duplicates</div>
            <div>✓ Identified 15 optimization opportunities</div>
            <div className="text-green-400">✓ Report generated successfully!</div>
          </motion.div>
        </div>

        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
