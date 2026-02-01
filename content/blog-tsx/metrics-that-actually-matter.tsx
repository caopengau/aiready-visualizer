import meta from './metrics-that-actually-matter.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <div className="prose max-w-none text-slate-700">
    <p>
      For decades, software teams have relied on metrics like cyclomatic
      complexity, code coverage, and lint warnings to measure code quality.
      These tools were designed for human reviewers. But as AI-assisted
      development becomes the norm, these old metrics are no longer enough. AI
      models don’t “see” code the way humans do. They don’t care about your
      coverage percentage or how many branches your function has. What matters
      is how much context they can fit, how consistent your patterns are, and
      how much semantic duplication lurks beneath the surface.
    </p>
    <p>
      That’s why we built <strong>AIReady</strong>: to measure what actually
      matters for AI-driven teams.
    </p>

    <h2>Why Existing Tools Fall Short</h2>
    <p>
      Tools like <strong>madge</strong> and <strong>dependency-cruiser</strong>{" "}
      are great for visualizing dependencies and spotting cycles, but they
      don’t answer the questions that matter for AI:
    </p>
    <ul>
      <li>How much of your codebase is semantically duplicated?</li>
      <li>How fragmented is your domain logic across files?</li>
      <li>How consistent are your naming and patterns?</li>
    </ul>
    <p>Traditional metrics miss these AI-specific pain points.</p>

    <h2>The Three Dimensions of AI-Readiness</h2>
    <p>AIReady focuses on three core metrics:</p>

    <div className="my-12 max-w-2xl mx-auto">
      <img
        src="/series-3-metrics-that-matters.png"
        alt="The Three Dimensions of AI-Readiness: Semantic Similarity, Context Budget, and Consistency Scoring"
        className="rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-full"
      />
      <p className="text-center text-sm text-slate-500 mt-4 italic">The three metrics that actually matter for AI-ready codebases: semantic similarity, context budget, and consistency.</p>
    </div>

    <h3>1. Semantic Similarity (pattern-detect)</h3>
    <ul>
      <li><strong>What it is:</strong> Finds code that does the same thing, even if it looks different.</li>
      <li><strong>How:</strong> Uses Jaccard similarity on AST tokens to detect “semantic duplicates.”</li>
      <li><strong>Why it matters:</strong> AI models waste context window on repeated logic, making suggestions less relevant and increasing maintenance cost.</li>
    </ul>

    <CodeBlock lang="typescript">{`
// File 1
function validateUser(u) { return u.id && u.email.includes('@'); }

// File 2
const isValidUser = (user) => user.id && user.email.indexOf('@') !== -1;
`}</CodeBlock>

    <h3>2. Context Budget (context-analyzer)</h3>
    <ul>
      <li><strong>What it is:</strong> Measures the “token cost” of understanding a feature or file.</li>
      <li><strong>How:</strong> Analyzes import chains, file size, and fragmentation to estimate how much context an AI needs to answer a question about your code.</li>
      <li><strong>Why it matters:</strong> The more fragmented your logic, the more tokens are needed—quickly exceeding the model’s window and leading to hallucinations or missed context.</li>
    </ul>

    <CodeBlock lang="typescript">{`
// src/api/users.ts
import { getUserById } from '../services/user-service'; // +2,100 tokens
import { validateUser } from '../utils/user-validation'; // +1,800 tokens
// ...
`}</CodeBlock>

    <h3>3. Consistency Scoring (consistency)</h3>
    <ul>
      <li><strong>What it is:</strong> Quantifies naming and pattern drift across your codebase.</li>
      <li><strong>How:</strong> Tracks how often similar things are named or structured differently.</li>
      <li><strong>Why it matters:</strong> Inconsistent code confuses both humans and AIs, reducing the quality of suggestions and increasing onboarding time.</li>
    </ul>
    <p>Example of inconsistency:</p>
    <ul>
      <li><code>getUserById</code>, <code>fetchUser</code>, <code>retrieveUser</code> — all for the same operation.</li>
    </ul>

    <h2>Hub-and-Spoke Architecture: Flexibility by Design</h2>
    <p>AIReady uses a <strong>hub-and-spoke</strong> model:</p>
    <ul>
      <li><strong>Hub:</strong> Shared utilities, types, and the CLI interface.</li>
      <li><strong>Spokes:</strong> Each metric is a focused tool (pattern-detect, context-analyzer, consistency), independently useful and pluggable.</li>
    </ul>
    <p>This makes it easy to add new metrics, customize for your team, and keep the core lean.</p>

    <h2>Smart Defaults: Focus on What Matters</h2>
    <p>
      By default, AIReady surfaces the ~10 most serious issues in each
      category. No more drowning in thousands of low-priority warnings—just the
      problems that will actually move the needle for your team.
    </p>

    <h2>Open Source and Configurable</h2>
    <p>AIReady is open source and designed for customization:</p>
    <ul>
      <li>Tweak thresholds, add or remove metrics, and integrate with your CI/CD.</li>
      <li>Teams can adapt the tools to their own context and priorities.</li>
    </ul>

    <h2>Conclusion</h2>
    <p>
      If you’re still measuring code quality with tools built for humans,
      you’re missing the real blockers to AI productivity. AIReady gives you
      the metrics that actually matter—so you can build codebases that are
      ready for the future.
    </p>

    <p>
      <strong>Try it yourself:</strong>
    </p>
    <CodeBlock lang="bash">{`
npx @aiready/pattern-detect ./src
npx @aiready/context-analyzer ./src
`}</CodeBlock>

    <p>
      <strong>Have questions or want to share your AI code quality story?</strong>{" "}
      Drop them in the comments. I read every one.
    </p>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p className="text-sm italic text-slate-500">
      *Peng Cao is the founder of{" "}
      <a href="https://receiptclaimer.com">receiptclaimer</a> and creator of{" "}
      <a href="https://github.com/caopengau/aiready">aiready</a>, an open-source
      suite for measuring and optimizing codebases for AI adoption.*
    </p>
  </div>
);

export default Post;
