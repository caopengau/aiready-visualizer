import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as Icons from '@/components/Icons';
import type { RemediationRequest } from '@/lib/db/types';

// Fail-safe icon helper
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const SvgIcon = (Icons as any)[name];
  if (!SvgIcon) {
    return <div className={className + ' bg-slate-800 rounded-sm'} />;
  }
  return <SvgIcon className={className} />;
};

interface RemediationQueueProps {
  repoId: string;
  hasIssues: boolean;
}

export function RemediationQueue({ repoId, hasIssues }: RemediationQueueProps) {
  const [remediations, setRemediations] = useState<RemediationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemediations();
    const interval = setInterval(fetchRemediations, 5000); // Poll for agent status
    return () => clearInterval(interval);
  }, [repoId]);

  async function fetchRemediations() {
    try {
      const res = await fetch(`/api/repos/${repoId}/remediations`);
      const data = await res.json();
      if (res.ok) {
        setRemediations(data.remediations);
      }
    } catch (err) {
      console.error('Error fetching remediations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemediate(id: string) {
    try {
      const res = await fetch('/api/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remediationId: id }),
      });
      if (res.ok) {
        fetchRemediations();
      }
    } catch (err) {
      console.error('Error triggering remediation:', err);
    }
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Icon name="HammerIcon" className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Remediation Queue</h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
          Alpha • Agentic
        </span>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : remediations.length === 0 ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
              <Icon name="ShieldCheckIcon" className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-lg font-bold">Queue is Empty</h4>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              Great job! Your repository meets all the AI-readiness standards.
              No pending remediations detected.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {remediations.map((rem) => (
                <motion.div
                  key={rem.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-left flex items-start gap-4"
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      rem.risk === 'critical'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {rem.status === 'in-progress' ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon
                        name={
                          rem.risk === 'critical'
                            ? 'AlertTriangleIcon'
                            : 'InfoIcon'
                        }
                        className="w-5 h-5"
                      />
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">
                        {rem.title}
                      </p>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                        {rem.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {rem.agentStatus || rem.description}
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <span
                        className={`text-[9px] font-black uppercase p-1 rounded border ${
                          rem.risk === 'critical'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}
                      >
                        {rem.risk}
                      </span>
                      {rem.prUrl && (
                        <Link
                          href={rem.prUrl}
                          target="_blank"
                          className="text-[9px] font-black uppercase p-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1 hover:bg-green-500/20 transition-colors"
                        >
                          PR #{rem.prNumber}
                          <Icon name="ExternalLinkIcon" className="w-2 h-2" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {rem.status === 'pending' && (
                    <button
                      onClick={() => handleRemediate(rem.id)}
                      className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-500 rounded-lg hover:bg-cyan-500 group transition-all hover:text-slate-950"
                    >
                      <span className="text-[10px] font-bold">Fix with AI</span>
                      <Icon
                        name="ArrowRightIcon"
                        className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="pt-4 p-6 rounded-2xl bg-cyan-500/5 border border-dashed border-cyan-500/30">
              <p className="text-xs text-cyan-400 font-bold mb-3 uppercase tracking-widest">
                AIReady Pro Features
              </p>
              <h5 className="text-sm font-bold mb-2 text-white">
                Autonomous Maintenance
              </h5>
              <p className="text-xs text-slate-400">
                Managed remediation agents proactively fix issues like these and
                ensure your AI leverage never decays.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
