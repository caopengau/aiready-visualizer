"use client";

import { motion } from "framer-motion";
import { ParallaxSection } from "./ParallaxSection";

export function AIReadinessScore() {
  return (
    <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-slate-50">
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
              One Number That{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Tells The Story
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get your AI Readiness Score: A single 0-100 metric combining all three tools with proven weighting.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Score Example */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-lg"
            >
              <div className="mb-6">
                <div className="text-6xl font-black text-slate-900 mb-2">65/100</div>
                <div className="text-2xl font-bold text-orange-600 mb-4">Fair Rating</div>
                <code className="text-sm text-slate-600 block">
                  aiready scan . --score
                </code>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Pattern Detection</span>
                  <span className="font-bold text-slate-900">66/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '66%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Context Analysis</span>
                  <span className="font-bold text-slate-900">52/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full" style={{width: '52%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Consistency</span>
                  <span className="font-bold text-slate-900">80/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>

              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                <strong>Formula:</strong> (66×40 + 52×35 + 80×25) / 100 = 65
              </div>
            </motion.div>

            {/* Rating Scale & Customization */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Rating Scale</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-slate-900">90-100 Excellent</span>
                    <span className="text-slate-600 text-sm">AI works optimally</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-semibold text-slate-900">75-89 Good</span>
                    <span className="text-slate-600 text-sm">Minor improvements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="font-semibold text-slate-900">60-74 Fair</span>
                    <span className="text-slate-600 text-sm">Noticeable confusion</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-semibold text-slate-900">40-59 Needs Work</span>
                    <span className="text-slate-600 text-sm">Significant struggles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-800"></div>
                    <span className="font-semibold text-slate-900">0-39 Critical</span>
                    <span className="text-slate-600 text-sm">Major refactoring</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">🎯 Customizable & Forward-Compatible</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Adjust weights for your priorities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Set thresholds for CI/CD gates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Auto-rebalances as new tools launch</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Track improvements over time</span>
                  </li>
                </ul>
                <code className="text-xs text-slate-600 block mt-4 p-3 bg-white rounded">
                  aiready scan . --score --weights patterns:50,context:30
                </code>
              </div>
            </motion.div>
          </div>
        </div>
      </ParallaxSection>
    </section>
  );
}
