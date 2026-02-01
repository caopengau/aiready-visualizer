import meta from './invisible-codebase.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const codeReceiptComparison = `// File: api/receipts/validate.ts
function checkReceiptData(data: any): boolean {
  if (!data.merchant) return false;
  if (!data.amount) return false;
  if (data.amount <= 0) return false;
  if (!data.date) return false;
  return true;
}

// File: lib/validators/receipt-validator.ts
export function isValidReceipt(receipt: ReceiptInput): boolean {
  const hasRequiredFields = receipt.merchant && 
                           receipt.amount && 
                           receipt.date;
  const hasPositiveAmount = receipt.amount > 0;
  return hasRequiredFields && hasPositiveAmount;
}`;

// (removed duplicated function block)

                          const codeReceiptFragmented = `src/
  api/
    receipts/
      upload.ts          # Handles file upload
      extract.ts         # Calls OCR service
      parse.ts           # Parses OCR response
  lib/
    ocr/
      google-vision.ts   # Google Vision integration
      openai-vision.ts   # OpenAI Vision integration
    parsers/
      receipt-parser.ts  # Parsing logic
  services/
    receipt-service.ts   # Business logic
  utils/
    file-upload.ts       # S3 upload helper
`;

                          const codeReceiptConsolidated = `src/
  domains/
    receipt-processing/
      index.ts           # Public API
      ocr-service.ts     # OCR abstraction
      parser.ts          # Parsing logic
      storage.ts         # S3 operations
      types.ts           # Shared types`;

                          const codeHelpersExample = `// lib/utils/helpers.ts (820 lines)
export function formatCurrency(amount: number): string { ... }
export function parseDate(dateStr: string): Date { ... }
export function uploadToS3(file: Buffer): Promise<string> { ... }
export function validateEmail(email: string): boolean { ... }
export function generateToken(): string { ... }
export function calculateGST(amount: number): number { ... }
export function hashPassword(pwd: string): Promise<string> { ... }`;

                          const Callout = ({ type, children }: { type: 'info' | 'tip' | 'warn' | 'danger'; children: React.ReactNode }) => {
                            const color =
                              type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-900' :
                              type === 'tip' ? 'bg-green-50 border-green-400 text-green-900' :
                              type === 'warn' ? 'bg-yellow-50 border-yellow-400 text-yellow-900' :
                              'bg-red-50 border-red-400 text-red-900';
                            return <div className={`my-6 p-4 border-l-4 rounded-md ${color}`}>{children}</div>;
                          };

                          const SectionDivider = () => <hr className="my-12 border-t-2 border-blue-100" />;

                          const Post: React.FC = () => (
                            <div className="prose max-w-none text-slate-700">
                              <Callout type="info">
                                <strong>Key Insight:</strong> AI can only see what you make visible. Code structure, duplication, and fragmentation all impact AI's ability to help you.
                              </Callout>

                              <p>I watched GitHub Copilot suggest the same validation logic three times in one week. Different syntax. Different variable names. Same exact purpose.</p>
                              <p>The AI wasn't broken. My codebase was invisible.</p>

                              <div className="my-12 max-w-2xl mx-auto">
                                <img 
                                  src="/series-2-invisible-to-ai.png" 
                                  alt="Why your codebase is invisible to AI" 
                                  className="rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-full"
                                />
                                <p className="text-center text-sm text-slate-500 mt-4 italic">AI models have limited visibility. If your logic is fragmented, it remains invisible to the AI's context.</p>
                              </div>

                              <p>Here's the problem: AI can write code, but it can't <em>see</em> your patterns. Not the way humans do. When you have the same logic scattered across different files with different names, AI treats each one as unique. So it solves it again. And again.</p>

                              <Callout type="warn">
                                <strong>Warning:</strong> This isn't just annoying. It's expensive.
                              </Callout>

                              <SectionDivider />

                              <h2>The Context Window Crisis</h2>
                              <p>Every time your AI assistant helps with code, it needs context. It reads your file, follows imports, understands dependencies. All of this costs tokens. The more fragmented your code, the more tokens you burn.</p>
                              <p>Let me show you a real example from building <span className="font-semibold text-purple-700">ReceiptClaimer</span>.</p>

                              <h3>Example 1: User Validation - The Hard Way</h3>
                              <p>I had user validation logic spread across 8 files:</p>
                              <ul>
                                <li><code>api/auth/validate-email.ts</code></li>
                                <li><code>api/auth/validate-password.ts</code></li>
                                <li><code>api/users/check-email-exists.ts</code></li>
                                <li><code>api/users/validate-username.ts</code></li>
                                <li><code>lib/validators/email.ts</code></li>
                                <li><code>lib/validators/password-strength.ts</code></li>
                                <li><code>utils/auth/email-format.ts</code></li>
                                <li><code>utils/validation/user-fields.ts</code></li>
                              </ul>
                              <p>Each file: 80–150 lines. Different patterns. Different error handling. Different import chains.</p>

                              <p>When AI needed to help with user validation, it had to:</p>
                              <ol>
                                <li>Read the current file (200 tokens)</li>
                                <li>Follow imports to understand the pattern (3,200 tokens)</li>
                                <li>Pull in dependencies to match types (5,800 tokens)</li>
                                <li>Scan similar files to understand conventions (3,250 tokens)</li>
                              </ol>
                              <p><strong>Total context cost: 12,450 tokens per request.</strong></p>

                              <h3>Example 2: User Validation - The Smart Way</h3>
                              <p>After refactoring, I consolidated to 2 files:</p>
                              <ul>
                                <li><code>lib/user-validation/index.ts</code> - All validation logic</li>
                                <li><code>lib/user-validation/types.ts</code> - Shared types</li>
                              </ul>
                              <p>Each file: 200–250 lines. Single pattern. Clear error handling. Minimal imports.</p>

                              <p><strong>It costs far less for AI to help after consolidation.</strong></p>

                              <h2>Three Ways Your Code Becomes Invisible</h2>

                              <h3>1. Semantic Duplicates: Same Logic, Different Disguise</h3>
                              <p>Traditional linters catch copy-paste duplication. They're useless for semantic duplicates.</p>
                              <p>Here's what I mean. Both functions do the exact same thing:</p>
                              <CodeBlock>{codeReceiptComparison}</CodeBlock>

                              <h3>2. Domain Fragmentation: Scattered Logic That Bleeds Tokens</h3>
                              <p><strong>Receipt Processing (fragmented):</strong></p>
                              <CodeBlock lang="text">{codeReceiptFragmented}</CodeBlock>

                              <p><strong>Receipt Processing (consolidated):</strong></p>
                              <CodeBlock lang="text">{codeReceiptConsolidated}</CodeBlock>

                              <h3>3. Low Cohesion: Mixed Concerns That Confuse Everyone</h3>
                              <p>Instead of one file doing everything, you have files that do <em>unrelated</em> things. AI can't figure out what the file is <em>for</em>.</p>
                              <CodeBlock>{codeHelpersExample}</CodeBlock>

                              <SectionDivider />

                              <h2>How to Measure Invisibility</h2>
                              <p>You can't fix what you can't measure. So I built tools to measure these three dimensions.</p>

                              <h3>Measuring Semantic Duplicates</h3>
                              <ol>
                                <li><strong>Parse code into AST</strong> (Abstract Syntax Trees)</li>
                                <li><strong>Extract semantic tokens</strong> (variable names → generic placeholders)</li>
                                <li><strong>Calculate Jaccard similarity</strong> (set-based comparison)</li>
                              </ol>

                              <CodeBlock>{`// Function A
function validateUser(user) {
  if (!user.email) return false;
  if (!user.password) return false;
  return true;
}

// Function B
function checkUserValid(data) {
  const hasEmail = !!data.email;
  const hasPassword = !!data.password;
  return hasEmail && hasPassword;
}`}</CodeBlock>

                                <CodeBlock lang="text">{`Function A tokens: [if, not, property, return, false, return, true]
                Function B tokens: [const, property, return, and]`}</CodeBlock>

                              <p>Jaccard similarity: <strong>0.78</strong> (78% similar)</p>
                              <p>Anything above 0.70? Probably a semantic duplicate worth reviewing.</p>
                              <p><strong>Tool:</strong> <code>npx @aiready/pattern-detect</code></p>

                              <h3>Measuring Fragmentation</h3>
                              <p>Context budget tells you how many tokens AI needs to understand a file.</p>
                              <p>I built <code>@aiready/context-analyzer</code> to measure:</p>
                              <ol>
                                <li><strong>Import depth</strong> - How many levels deep do imports go?</li>
                                <li><strong>Context budget</strong> - Total tokens needed to understand this file</li>
                                <li><strong>Cohesion score</strong> - Are imports related to each other?</li>
                                <li><strong>Fragmentation score</strong> - Is this domain split across files?</li>
                              </ol>

                                <CodeBlock lang="bash">{`src/api/receipts/upload.ts
                Import depth: 7 levels
                Context budget: 12,450 tokens
                Cohesion: 0.34 (low - mixed concerns)
                Fragmentation: 0.78 (high - scattered domain)`}</CodeBlock>

                              <p>High fragmentation + low cohesion = AI will struggle.</p>
                              <p><strong>Tool:</strong> <code>npx @aiready/context-analyzer</code></p>

                              <h3>Measuring Consistency (Coming Soon)</h3>
                              <p>The third dimension: pattern consistency.</p>
                              <p>Do you handle errors the same way everywhere? Use the same naming conventions? Follow the same async patterns?</p>
                              <p>I'm building <code>@aiready/consistency</code> to detect:</p>
                              <ul>
                                <li>Mixed error handling patterns (try-catch vs callbacks vs promises)</li>
                                <li>Inconsistent naming (camelCase vs snake_case)</li>
                                <li>Import style drift (ES modules vs require)</li>
                                <li>Async pattern mixing (async/await vs .then())</li>
                              </ul>

                              <p><strong>Status:</strong> Beta release next week.</p>

                              <SectionDivider />

                              <h2>The ReceiptClaimer Results</h2>
                              <p>I ran these tools on my own codebase — <a href="https://receiptclaimer.com.au/">ReceiptClaimer</a>, an AI-powered receipt tracker for Australian taxpayers. Here's what I found:</p>

                              <h3>Before Measurement</h3>
                              <ul>
                                <li><strong>Semantic duplicates:</strong> 23 patterns repeated 87 times</li>
                                <li><strong>Average import depth:</strong> 5.8 levels</li>
                                <li><strong>Average context budget:</strong> 8,200 tokens per file</li>
                                <li><strong>Cohesion score:</strong> 0.42 (poor)</li>
                                <li><strong>Monthly AI costs:</strong> ~$380 (estimated)</li>
                              </ul>

                              <h3>After Refactoring (4 weeks)</h3>
                              <ul>
                                <li><strong>Semantic duplicates:</strong> 3 patterns repeated 8 times (-87%)</li>
                                <li><strong>Average import depth:</strong> 2.9 levels (-50%)</li>
                                <li><strong>Average context budget:</strong> 2,100 tokens per file (-74%)</li>
                                <li><strong>Cohesion score:</strong> 0.89 (excellent)</li>
                                <li><strong>Monthly AI costs:</strong> ~$95 (estimated)</li>
                              </ul>

                              <p><strong>Time invested:</strong> 40 hours over 4 weeks<br />
                              <strong>Annual savings:</strong> $3,420 in AI costs<br />
                              <strong>ROI:</strong> 12.6 months (probably faster due to velocity gains)</p>

                              <SectionDivider />

                              <h2>What You Can Do Today</h2>
                              <p>You don't need to refactor everything. Start with measurement.</p>

                              <h3>Step 1: Measure Your Semantic Duplicates</h3>
                              <CodeBlock lang="bash">{`npx @aiready/pattern-detect`}</CodeBlock>
                              <p>Look for:</p>
                              <ul>
                                <li>Similarity scores &gt; 70%</li>
                                <li>Patterns repeated 3+ times</li>
                                <li>Core domains (auth, validation, API handlers)</li>
                              </ul>

                              <h3>Step 2: Measure Your Fragmentation</h3>
                              <CodeBlock lang="bash">{`npx @aiready/context-analyzer`}</CodeBlock>
                              <p>Look for:</p>
                              <ul>
                                <li>Import depth &gt; 5 levels</li>
                                <li>Context budget &gt; 8,000 tokens</li>
                                <li>Cohesion score &lt; 0.50</li>
                                <li>Files with fragmentation &gt; 0.70</li>
                              </ul>

                              <h3>Step 3: Pick ONE Domain to Fix</h3>
                              <p>Don't refactor everything. Pick your most painful domain:</p>
                              <ul>
                                <li>The one where AI suggestions are worst</li>
                                <li>The one where code reviews take longest</li>
                                <li>The one where new developers get confused</li>
                              </ul>
                              <p>Focus there. Consolidate files. Extract common patterns. Measure again.</p>

                              <h3>Step 4: Track Improvements</h3>
                              <p>Run the tools weekly. Watch the metrics improve. Share results with your team.</p>
                              <p><strong>The goal isn't perfect code. It's visible code.</strong></p>

                              <SectionDivider />

                              <h2>Next in This Series</h2>
                              <p>In Part 3, I'll dive deep into the technical details: <strong>"Building AIReady: Metrics That Actually Matter"</strong></p>
                              <p>We'll explore:</p>
                              <ul>
                                <li>Why traditional metrics (cyclomatic complexity, code coverage) miss AI problems</li>
                                <li>How Jaccard similarity works on AST tokens (with diagrams)</li>
                                <li>The three dimensions of AI-readiness and how they interact</li>
                                <li>Design decisions: Why I built a hub-and-spoke architecture</li>
                                <li>Open source philosophy: Free forever, configurable by design</li>
                              </ul>
                              <p>Until then, run the tools. Measure your codebase. See how invisible it really is.</p>

                              <hr />

                              <p><strong>Try it yourself:</strong></p>
                              <ul>
                                <li>GitHub: <a href="https://github.com/caopengau/aiready">github.com/caopengau/aiready</a></li>
                                <li>Docs: <a href="https://aiready.dev">aiready.dev</a></li>
                              </ul>

                              <p><strong>Want to support this work?</strong></p>
                              <ul>
                                <li>⭐ Star the repo</li>
                                <li>🐛 Report issues you find</li>
                                <li>💬 Share your results (I read every comment)</li>
                              </ul>

                              <hr />

                              <p><em>Peng Cao is building open source tools for AI-ready development. He's also the creator of ReceiptClaimer, an AI-powered receipt tracker for Australian taxpayers. Follow along as he builds in public.</em></p>

                              <p><strong>Read the series:</strong></p>
                              <ul>
                                <li><a href="/blog/ai-code-debt-tsunami">Part 1: The AI Code Debt Tsunami is Here</a></li>
                                <li><strong>Part 2: Why Your Codebase is Invisible to AI</strong> ← You are here</li>
                                <li>Part 3: Building AIReady - Metrics That Actually Matter (coming Feb 7)</li>
                              </ul>
                            </div>
                          );

                          export default Post;
