import Script from 'next/script'
import AnimatedHero from '../components/AnimatedHero'
import AnimatedStats from '../components/AnimatedStats'
import InteractiveChart from '../components/InteractiveChart'
import ComparisonChart from '../components/ComparisonChart'
import FloatingElements from '../components/FloatingElements'
import ParallaxSection from '../components/ParallaxSection'
import RequestForm from '../components/RequestForm'
import { Header } from '../components/Header'
import { Features } from '../components/Features'
import { AIReadinessScore } from '../components/AIReadinessScore'
import { NotAnotherLinter } from '../components/NotAnotherLinter'
import { Testimonials } from '../components/Testimonials'
import { CTA } from '../components/CTA'
import { FAQ } from '../components/FAQ'
import { Footer } from '../components/Footer'
import { generateBreadcrumbSchema, generateWebsiteSchema, generateProductSchema, generateHowToSchema } from '../lib/seo'

export default function HomePage() {
  // SEO Structured Data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
  ]);

  const websiteSchema = generateWebsiteSchema();
  
  const productSchema = generateProductSchema();

  const howToSchema = generateHowToSchema({
    name: 'How to Make Your Codebase AI-Ready',
    description: 'Step-by-step guide to optimize your codebase for AI collaboration',
    totalTime: 'PT5M',
    steps: [
      {
        name: 'Install AIReady CLI',
        text: 'Run npx @aiready/cli scan . in your project directory',
        url: '/#get-started',
      },
      {
        name: 'Review Analysis Results',
        text: 'Check the detailed report showing semantic duplicates, context analysis, and consistency issues',
      },
      {
        name: 'Fix Issues',
        text: 'Address the identified issues to improve AI collaboration',
      },
      {
        name: 'Track Progress',
        text: 'Run regular scans to maintain your AI Readiness Score',
      },
    ],
  });

  return (
    <>
      {/* SEO Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-x-hidden">
        <FloatingElements />
      
      <Header />

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

      <Features />

      <AIReadinessScore />

      <NotAnotherLinter />

      <Testimonials />

      <CTA />

      {/* Request Report Form */}
      <section className="container mx-auto px-4 py-20">
        <ParallaxSection offset={10}>
          <RequestForm />
        </ParallaxSection>
      </section>

      <FAQ />

      <Footer />
      </div>
    </>
  )
}
