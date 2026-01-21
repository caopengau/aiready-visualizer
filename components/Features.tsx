"use client";

import { motion } from "framer-motion";
import { ParallaxSection } from "./ParallaxSection";
import { ToolShowcase } from "./ToolShowcase";

export function Features() {
  return (
    <section className="container mx-auto px-4 py-20">
      <ParallaxSection offset={20}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Three Powerful Tools,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                One Command
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Identify what confuses AI models, optimize context usage, 
              and unlock better AI collaboration—locally and safely.
            </p>
          </motion.div>
          
          <ToolShowcase />
        </div>
      </ParallaxSection>
    </section>
  );
}
