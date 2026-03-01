import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateTechArticleSchema,
  generateCollectionPageSchema,
  aiMetaTags,
} from '../lib/aeo-schema';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://getaiready.dev'),
  title: {
    default: 'AIReady - Make Your Codebase AI-Ready',
    template: '%s | AIReady',
  },
  description:
    'Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.',
  keywords: [
    'AI codebase optimization',
    'semantic duplicate detection',
    'context window analysis',
    'code consistency checker',
    'AI readiness score',
    'TypeScript analysis',
    'JavaScript linting',
    'developer tools',
    'AI pair programming',
    'code quality',
    'static analysis',
    'AST parsing',
    'open source tools',
    'free developer tools',
    'AI collaboration',
  ],
  authors: [{ name: 'AIReady Team', url: 'https://getaiready.dev' }],
  creator: 'AIReady',
  publisher: 'AIReady',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  icons: {
    icon: [
      { url: '/logo-transparent-bg.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-transparent-bg.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo-transparent-bg.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo-transparent-bg.png',
      },
    ],
  },
  openGraph: {
    title: 'AIReady - Make Your Codebase AI-Ready',
    description:
      'Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency.',
    url: 'https://getaiready.dev',
    siteName: 'AIReady',
    images: [
      {
        url: 'https://getaiready.dev/logo-text.png',
        width: 1200,
        height: 630,
        alt: 'AIReady - AI-Ready Codebase Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIReady - Make Your Codebase AI-Ready',
    description:
      'Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.',
    images: ['https://getaiready.dev/logo-text.png'],
    creator: '@aireadytools',
    site: '@aireadytools',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
  classification: 'Developer Tools',
  verification: {
    google: 'google-site-verification-token', // TODO: Replace with actual token
  },
  other: {
    // AI Search Engine specific meta tags for AEO
    'chatgpt:description': aiMetaTags.chatgpt['chatgpt:description'],
    'chatgpt:category': aiMetaTags.chatgpt['chatgpt:category'],
    'chatgpt:keywords': aiMetaTags.chatgpt['chatgpt:keywords'],
    'perplexity:summary': aiMetaTags.perplexity['perplexity:summary'],
    'perplexity:intent': aiMetaTags.perplexity['perplexity:intent'],
    'ai:summary': aiMetaTags.general['ai:summary'],
    'ai:category': aiMetaTags.general['ai:category'],
    'ai:type': aiMetaTags.general['ai:type'],
    'ai:pricing': aiMetaTags.general['ai:pricing'],
    'ai:license': aiMetaTags.general['ai:license'],
    // Universal Content Protocol
    'ucp:category': 'Developer Tools',
    'ucp:intent': 'Provide free CLI tools for codebase AI optimization',
    'ucp:action': 'npx @aiready/cli scan',
    'ucp:pricing': 'Free',
    'ucp:license': 'MIT',
    'ucp:repository': 'https://github.com/caopengau/aiready-cli',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Enhanced schemas for AEO and UCP
  const organizationSchema = generateOrganizationSchema();
  const softwareSchema = generateSoftwareApplicationSchema();
  const techArticleSchema = generateTechArticleSchema();
  const collectionPageSchema = generateCollectionPageSchema();

  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TT5Y6V853G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TT5Y6V853G');
          `}
        </Script>

        {/* Enhanced JSON-LD for Answer Engine Optimization */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="software-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <Script
          id="tech-article-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(techArticleSchema),
          }}
        />
        <Script
          id="collection-page-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionPageSchema),
          }}
        />
        {/* Syntax highlighting stylesheet for code blocks */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
