"use client";
import React, { useRef, useState, useMemo } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  children: React.ReactNode;
  lang?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, lang }) => {
  const [copied, setCopied] = useState(false);
  const language = lang || 'typescript';

  // Process children to fix indentation issues
  const cleanCode = useMemo(() => {
    // Normalize children to a string if possible
    let raw: string;
    if (typeof children === 'string') {
      raw = children;
    } else {
      // Attempt to coerce React children to a string for template literals
      try {
        raw = React.Children.toArray(children as React.ReactNode)
          .map((c) => (typeof c === 'string' ? c : (typeof c === 'number' ? String(c) : '')))
          .join('');
      } catch (e) {
        return children;
      }
    }

    // Normalize tabs to two spaces and trim trailing whitespace
    raw = raw.replace(/\t/g, '  ').replace(/[ \t]+$/gm, '');

    const lines = raw.split('\n');
    if (lines.length <= 1) return raw.trim();

    // Remove leading/trailing empty lines
    let start = 0;
    while (start < lines.length && lines[start].trim() === '') start++;
    let end = lines.length - 1;
    while (end >= 0 && lines[end].trim() === '') end--;
    const relevantLines = lines.slice(start, end + 1);

    // Remove common leading indentation introduced by template literal
    // formatting in the source (dedent behavior). Find minimum indent
    // across non-empty lines and remove it.
    const nonEmpty = relevantLines.filter((l) => l.trim() !== '');
    const minIndent = nonEmpty.reduce((min, line) => {
      const m = line.match(/^\s*/)?.[0].length ?? 0;
      return Math.min(min, m);
    }, Infinity);
    const dedented = minIndent === Infinity || minIndent === 0
      ? relevantLines.join('\n')
      : relevantLines.map((l) => (l.startsWith(' '.repeat(minIndent)) ? l.slice(minIndent) : l)).join('\n');
    return dedented;
  }, [children]);

  // Highlight the code synchronously
  const highlightedCode = useMemo(() => {
    if (typeof cleanCode === 'string') {
      try {
        const result = hljs.highlight(cleanCode, { language });
        return result.value;
      } catch (e) {
        return cleanCode;
      }
    }
    return '';
  }, [cleanCode, language]);

  const handleCopy = async () => {
    const text = typeof cleanCode === 'string' ? cleanCode : '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (typeof cleanCode !== 'string') {
    return (
      <div className="group relative my-8 overflow-hidden rounded-2xl code-block shadow-lg">
        <pre className="rounded-2xl overflow-x-auto p-4 text-sm leading-snug">
          <code className={`language-${language} font-mono block whitespace-pre`}>
            {cleanCode}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="group relative my-8 overflow-hidden rounded-2xl code-block shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/40" />
            <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
          </div>
          <span className="ml-2 text-sm font-semibold uppercase tracking-wider text-slate-500 font-mono">
            {language}
          </span>
        </div>
        
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors duration-200 text-slate-500 hover:text-slate-900 ${copied ? 'text-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              COPIED
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              COPY
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <pre
        className="rounded-b-2xl overflow-x-auto p-4 text-sm leading-snug"
      >
        <code 
          className={`language-${language} font-mono block whitespace-pre hljs`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeBlock;
