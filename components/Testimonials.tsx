"use client";

import { motion } from "framer-motion";
import { ParallaxSection } from "./ParallaxSection";

const testimonials = [
  {
    quote: "aiready helped us identify 200+ semantic duplicates across our React components. Our AI context windows are now 35% more efficient.",
    author: "Sarah Chen",
    role: "Senior Engineer at TechFlow",
    delay: 0,
  },
  {
    quote: "The consistency checker caught naming inconsistencies that would have confused our AI pair programmer for weeks. Game changer for our workflow.",
    author: "Mike Rodriguez",
    role: "Tech Lead at DevCorp",
    delay: 0.15,
  },
];

export function Testimonials() {
  return (
    <section className="container mx-auto px-4 py-20">
      <ParallaxSection offset={15}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Developers
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              See what teams are saying about aiready
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: testimonial.delay, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 shadow-xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: testimonial.delay + 0.1 * i, duration: 0.3 }}
                      viewport={{ once: true }}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </motion.svg>
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxSection>
    </section>
  );
}
