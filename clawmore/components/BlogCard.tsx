'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock, Hash } from 'lucide-react';

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  hash: string;
  category: string;
}

export default function BlogCard({
  slug,
  title,
  excerpt,
  date,
  readTime,
  hash,
  category,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="block group h-full">
      <div className="glass-card p-10 h-full border-white/5 hover:border-cyber-purple/30 transition-all bg-white/[0.01] hover:bg-white/[0.03] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
        {/* Neon Glow on Hover */}
        <div className="absolute inset-0 bg-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8">
          <div className="text-cyber-purple font-mono text-[9px] uppercase tracking-[0.4em] font-black">
            {category}
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[9px] group-hover:text-cyber-purple transition-colors">
            <Hash className="w-3 h-3" />
            <span>{hash}</span>
          </div>
        </div>

        <h3 className="text-3xl font-black mb-6 tracking-tighter italic leading-tight group-hover:text-cyber-purple transition-colors">
          {title}
        </h3>

        <p className="text-zinc-500 text-sm leading-relaxed mb-10 flex-grow font-light">
          {excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 text-zinc-600 font-mono text-[9px] uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{readTime}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>{date}</span>
          </div>

          <div className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-cyber-purple group-hover:text-black transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
