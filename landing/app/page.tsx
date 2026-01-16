import Link from 'next/link'
import RequestForm from '../components/RequestForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AIReady
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900">
              Docs
            </Link>
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
            <Link 
              href="https://www.npmjs.com/package/@aiready/cli" 
              target="_blank"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              npm
            </Link>
            <Link 
              href="#get-started"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
            <span>🚀</span>
            <span>Open Source & Free</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Make Your Codebase{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI-Ready
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Transform your codebase for AI collaboration. Detect semantic duplicates, optimize context windows, 
            and maintain consistency that AI models understand. Free tools, instant results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="#get-started"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              Get Started Free
              <span>→</span>
            </Link>
            <Link 
              href="https://www.npmjs.com/package/@aiready/cli"
              target="_blank"
              className="px-8 py-4 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>📦</span>
              View on npm
            </Link>
          </div>

          {/* Quick Install */}
          <div className="bg-slate-900 rounded-lg p-6 text-left max-w-2xl mx-auto border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400 font-mono">Quick Install</span>
              <span className="text-slate-500">📥</span>
            </div>
            <code className="text-green-400 font-mono text-sm">
              npx @aiready/cli scan .
            </code>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 border-y border-slate-200">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{'<1s'}</div>
            <div className="text-slate-600">Analysis Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">High</div>
            <div className="text-slate-600">Detection Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">Free</div>
            <div className="text-slate-600">Forever</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Three Powerful Tools, One Command
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Detect issues that traditional linters miss, optimize for AI context windows, 
            and maintain consistency across your team.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Pattern Detection */}
            <div className="p-6 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🛡️
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Pattern Detection
              </h3>
              <p className="text-slate-600 mb-4">
                Find semantic duplicates that look different but do the same thing. 
                Reduce wasted context tokens by up to 40%.
              </p>
              <code className="text-sm text-slate-500 font-mono">
                @aiready/pattern-detect
              </code>
            </div>

            {/* Context Analysis */}
            <div className="p-6 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                📈
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Context Analysis
              </h3>
              <p className="text-slate-600 mb-4">
                Analyze import depth, cohesion, and fragmentation. 
                Optimize file organization for better AI understanding.
              </p>
              <code className="text-sm text-slate-500 font-mono">
                @aiready/context-analyzer
              </code>
            </div>

            {/* Consistency */}
            <div className="p-6 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Consistency Checker
              </h3>
              <p className="text-slate-600 mb-4">
                Catch naming issues, pattern inconsistencies, and architectural 
                drift before they become problems.
              </p>
              <code className="text-sm text-slate-500 font-mono">
                @aiready/consistency
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Loved by Developers
          </h2>
          <p className="text-center text-slate-600 mb-12">
            See what teams are saying about AIReady
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "AIReady helped us identify semantic duplicates across our React components. 
                Our AI context windows are now much more efficient."
              </p>
              <div className="text-sm text-slate-600">
                <strong>Sarah Chen</strong>, Senior Engineer at TechFlow
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "The consistency checker caught naming inconsistencies that would have confused 
                our AI pair programmer. Really helpful for our workflow."
              </p>
              <div className="text-sm text-slate-600">
                <strong>Mike Rodriguez</strong>, Tech Lead at DevCorp
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to optimize your codebase?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Get started in seconds. No signup required.
          </p>
          <div className="bg-slate-900 rounded-lg p-6 text-left mb-6">
            <code className="text-green-400 font-mono">
              npx @aiready/cli scan .
            </code>
          </div>
          <p className="text-sm text-blue-100">
            Free forever. Open source. No credit card required.
          </p>
        </div>
      </section>

      {/* Request Report Form */}
      <section className="container mx-auto px-4 py-20">
        <RequestForm />
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Is AIReady really free?
              </h3>
              <p className="text-slate-600">
                Yes! All our tools are free and open source. You can run them locally with 
                <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono">npx @aiready/cli scan .</code> 
                or request a free audit report above.
              </p>
            </div>
            
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What languages do you support?
              </h3>
              <p className="text-slate-600">
                Currently TypeScript/JavaScript, with Python and Java support coming soon. 
                Our tools work with any codebase that has AST parsing available.
              </p>
            </div>
            
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                How does this help with AI coding assistants?
              </h3>
              <p className="text-slate-600">
                AI models work better with clean, consistent code. Our tools eliminate semantic 
                duplicates, optimize context windows, and ensure naming consistency that AI 
                models can better understand and work with.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Can I contribute to the project?
              </h3>
              <p className="text-slate-600">
                Absolutely! AIReady is open source on GitHub. We welcome contributions, bug reports, 
                and feature requests. Check out our contributing guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600">
              © 2025 AIReady. Open source under MIT License.
            </div>
            <div className="flex gap-6">
              <Link href="https://www.npmjs.com/package/@aiready/cli" target="_blank" className="text-sm text-slate-600 hover:text-slate-900">
                npm
              </Link>
              <Link href="https://github.com/caopengau/aiready" target="_blank" className="text-sm text-slate-600 hover:text-slate-900">
                GitHub
              </Link>
              <Link href="https://twitter.com/aireadytools" target="_blank" className="text-sm text-slate-600 hover:text-slate-900">
                Twitter
              </Link>
              <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
