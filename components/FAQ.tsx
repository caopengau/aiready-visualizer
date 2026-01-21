"use client";

import Script from "next/script";
import { motion } from "framer-motion";
import { ParallaxSection } from "./ParallaxSection";

const faqs = [
  {
    question: "Is aiready really free?",
    answer: "Yes! All our tools are free and open source. You can run them locally with npx @aiready/cli scan . or request a free audit report above.",
  },
  {
    question: "Where does my code go?",
    answer: "Nowhere. Everything runs locally on your machine. Zero network calls. No code upload. No SaaS. Air-gap compatible. See our Security page for full details.",
  },
  {
    question: "Is this another linter?",
    answer: "No. Linters check code correctness. AIReady checks AI understandability. We find semantic duplicates, context fragmentation, and pattern inconsistencies that confuse AI models—things ESLint can't detect.",
  },
  {
    question: "What languages do you support?",
    answer: "Currently TypeScript/JavaScript, with Python and Java support coming soon. Our tools work with any codebase that has AST parsing available.",
  },
  {
    question: "Can I contribute to the project?",
    answer: "Absolutely! AIReady is open source on GitHub. We welcome contributions, bug reports, and feature requests. Check out our contributing guidelines.",
  },
];

export function FAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.slice(0, 4).map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="container mx-auto px-4 py-20">
        <ParallaxSection offset={10}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
            </motion.div>
            
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-lg hover:shadow-xl"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </ParallaxSection>
      </section>
    </>
  );
}
