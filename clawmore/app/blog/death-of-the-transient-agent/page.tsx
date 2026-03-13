'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Hash,
  Terminal,
  Activity,
  RefreshCcw,
  ShieldCheck,
  Cpu,
  Zap,
  ChevronRight,
} from 'lucide-react';
import Modal from '../../../components/Modal';
import LeadForm from '../../../components/LeadForm';

export default function BlogPost() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const apiUrl = process.env.NEXT_PUBLIC_LEAD_API_URL || '';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyber-purple/30 selection:text-cyber-purple font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="ClawMore Logo"
              width={32}
              height={32}
              className="drop-shadow-[0_0_8px_rgba(188,0,255,0.6)]"
            />
            <span className="text-xl font-bold tracking-tight italic glow-text">
              ClawMore
            </span>
          </Link>
          <div className="flex items-center gap-8 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            <Link
              href="/blog"
              className="hover:text-cyber-purple transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Journal
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(188,0,255,0.05)_0%,_transparent_70%)] opacity-30" />

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="text-cyber-purple font-mono text-[9px] uppercase tracking-[0.4em] font-black border border-cyber-purple/20 px-2 py-1 bg-cyber-purple/5">
                CORE_ENGINE
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: 5086da9</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>06 MIN READ</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic leading-[1.1]">
              The Death of the <br />
              <span className="text-cyber-purple">Transient Agent</span>
            </h1>

            <p className="text-xl text-zinc-400 font-light leading-relaxed italic">
              Why stateless chat with infrastructure is a dead end. Introducing
              the case for mutable logic state that persists to source control.
            </p>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <article className="prose prose-invert prose-zinc max-w-none">
              <div className="space-y-12">
                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      01
                    </span>
                    The Context Window Trap
                  </h2>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    Current AI infrastructure assistants operate as transient
                    observers. You ask for a VPC, they generate a snippet, and
                    then they vanish. The "context" of your infrastructure
                    exists only in the volatile memory of a chat session. When
                    that session ends, the intelligence disappears.
                  </p>
                  <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-sm font-mono text-[11px] text-zinc-500 italic">
                    {'// Standard Workflow: Volatile & Disconnected'} <br />
                    {'1. Human asks for S3 bucket'} <br />
                    {'2. AI generates CloudFormation'} <br />
                    {'3. Human copy-pastes (Manual Error Risk)'} <br />
                    {
                      "4. Context is lost. AI has no memory of the bucket's purpose."
                    }
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      02
                    </span>
                    Mutation as Primary Logic
                  </h2>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    ClawMore treats infrastructure as{' '}
                    <span className="text-white italic font-bold">
                      Mutable Logic State
                    </span>
                    . Instead of providing advice, the engine synthesizes a
                    patch and commits it directly to your source control. The
                    "truth" isn't in a database—it's in your Git history.
                  </p>
                  <p className="text-zinc-400 leading-relaxed text-lg mt-6">
                    This creates a recursive loop where the agent doesn't just
                    manage the infrastructure; it{' '}
                    <span className="text-cyber-purple">becomes</span> the
                    infrastructure.
                  </p>
                </section>

                {/* Technical Insight Box */}
                <div className="p-10 glass-card border-cyber-purple/20 bg-cyber-purple/[0.02] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <RefreshCcw size={80} className="animate-spin-slow" />
                  </div>
                  <h4 className="text-cyber-purple font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> RECURSIVE_INTEGRITY_CHECK
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed italic mb-0">
                    "By persisting mutations to Git, we ensure that the system's
                    reasoning is versioned alongside its execution. Every
                    'thought' is a commit. Every 'action' is a merge."
                  </p>
                </div>

                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-4">
                    <span className="text-cyber-purple font-mono text-sm">
                      03
                    </span>
                    The Reflective Neural Loop
                  </h2>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    In the next post, we'll dive into the **Neural Spine**—the
                    EventBridge-driven mesh that allows these mutations to
                    happen autonomously. We'll explore how the Reflector detects
                    infrastructure gaps and signals the Architect to design a
                    mutation.
                  </p>
                </section>
              </div>

              {/* Series Navigation */}
              <div className="mt-24 pt-12 border-t border-white/5">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em] mb-8">
                  Up_Next_In_The_Cycle
                </div>
                <Link
                  href="/blog/eventbridge-the-neural-spine"
                  className="block group"
                >
                  <div className="glass-card p-8 flex items-center justify-between hover:border-cyber-purple/30 transition-all bg-white/[0.01]">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-sm bg-cyber-purple/10 flex items-center justify-center text-cyber-purple border border-cyber-purple/20">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-cyber-purple uppercase tracking-widest mb-1">
                          PART 02 // NETWORK_SPINE
                        </div>
                        <div className="text-2xl font-black italic group-hover:text-white transition-colors">
                          EventBridge: The Neural Spine
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-cyber-purple group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>

      {/* Subscription Section */}
      <section className="py-24 bg-cyber-purple/[0.02] border-y border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-black italic mb-6">Stay Synchronized</h3>
          <p className="text-zinc-500 mb-10 max-w-lg mx-auto text-sm">
            Join 1,200+ architects receiving autonomous mutation logs and
            technical deep dives weekly.
          </p>
          <button
            onClick={openModal}
            className="px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-cyber-purple transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Join Mutation_List
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center text-zinc-700 text-[10px] font-mono uppercase tracking-[0.5em]">
          TERMINAL_LOCKED // 2026 PERPETUAL_EVOLUTION
        </div>
      </footer>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <LeadForm type="waitlist" onSuccess={closeModal} apiUrl={apiUrl} />
      </Modal>
    </div>
  );
}
