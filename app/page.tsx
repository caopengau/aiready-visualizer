"use client";

import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Script from 'next/script'
import RequestForm from '../components/RequestForm'
import AnimatedHero from '../components/AnimatedHero'
import AnimatedStats from '../components/AnimatedStats'
import ToolShowcase from '../components/ToolShowcase'
import InteractiveChart from '../components/InteractiveChart'
import ComparisonChart from '../components/ComparisonChart'
import FloatingElements from '../components/FloatingElements'
import ParallaxSection from '../components/ParallaxSection'

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is aiready really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All our tools are free and open source. You can run them locally with npx @aiready/cli scan . or request a free audit report above."
        }
      },
      {
        "@type": "Question",
        "name": "What languages do you support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently TypeScript/JavaScript, with Python and Java support coming soon. Our tools work with any codebase that has AST parsing available."
        }
      },
      {
        "@type": "Question",
        "name": "How does this help with AI coding assistants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI models work better with clean, consistent code. Our tools eliminate semantic duplicates, optimize context windows, and ensure naming consistency that AI models can better understand and work with."
        }
      },
      {
        "@type": "Question",
        "name": "Can I contribute to the project?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! AIReady is open source on GitHub. We welcome contributions, bug reports, and feature requests. Check out our contributing guidelines."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-x-hidden">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FloatingElements />
      
      {/* Header */}
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        <AnimatedHero />
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 relative">
        <AnimatedStats />
      </section>

      {/* Charts Section - Split layout */}
      <section className="container mx-auto px-4 py-20">
        <ParallaxSection offset={30}>
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            <InteractiveChart />
            <ComparisonChart />
          </div>
        </ParallaxSection>
      </section>

      {/* Features */}
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
                Detect issues that traditional linters miss, optimize for AI context windows, 
                and maintain consistency across your team.
              </p>
            </motion.div>
            
            <ToolShowcase />
          </div>
        </ParallaxSection>
      </section>

      {/* Testimonials */}
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
              {[
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
              ].map((testimonial, idx) => (
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
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: testimonial.delay + i * 0.1 }}
                        viewport={{ once: true }}
                        className="text-yellow-400 text-xl"
                      >
                        ⭐
                      </motion.span>
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

      {/* CTA Section */}
      <section id="get-started" className="container mx-auto px-4 py-20">
        <ParallaxSection offset={10}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
            
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-slate-900 rounded-[22px] p-12 text-center">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-black text-white mb-4"
                >
                  Ready to optimize your codebase?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-slate-300 mb-8 text-xl"
                >
                  Get started in seconds. No signup required.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-slate-800 rounded-2xl p-6 text-left mb-6 border border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <code className="text-green-400 font-mono text-lg">
                    npx @aiready/cli scan .
                  </code>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-sm text-slate-400"
                >
                  <span className="text-green-400 font-bold">✓</span> Free forever · 
                  <span className="text-green-400 font-bold"> ✓</span> Open source · 
                  <span className="text-green-400 font-bold"> ✓</span> No credit card required
                </motion.p>
              </div>
            </div>
          </motion.div>
        </ParallaxSection>
      </section>

      {/* Request Report Form */}
      <section className="container mx-auto px-4 py-20">
        <ParallaxSection offset={10}>
          <RequestForm />
        </ParallaxSection>
      </section>

      {/* FAQ */}
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
              {[
                {
                  question: "Is aiready really free?",
                  answer: "Yes! All our tools are free and open source. You can run them locally with npx @aiready/cli scan . or request a free audit report above.",
                },
                {
                  question: "What languages do you support?",
                  answer: "Currently TypeScript/JavaScript, with Python and Java support coming soon. Our tools work with any codebase that has AST parsing available.",
                },
                {
                  question: "How does this help with AI coding assistants?",
                  answer: "AI models work better with clean, consistent code. Our tools eliminate semantic duplicates, optimize context windows, and ensure naming consistency that AI models can better understand and work with.",
                },
                {
                  question: "Can I contribute to the project?",
                  answer: "Absolutely! AIReady is open source on GitHub. We welcome contributions, bug reports, and feature requests. Check out our contributing guidelines.",
                },
              ].map((faq, idx) => (
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

      {/* Footer */}
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
              {[
                { href: "https://www.npmjs.com/package/@aiready/cli", label: "NPM" },
                { href: "https://github.com/caopengau/aiready-cli", label: "GitHub" },
              ].map((link, idx) => (
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
    </div>
  )
}
