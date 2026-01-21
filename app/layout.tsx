import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://getaiready.dev'),
  title: {
    default: "aiready - Make Your Codebase AI-Ready",
    template: "%s | aiready"
  },
  description: "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.",
  keywords: [
    "AI codebase optimization",
    "semantic duplicate detection",
    "context window analysis",
    "code consistency checker",
    "AI readiness score",
    "TypeScript analysis",
    "JavaScript linting",
    "developer tools",
    "AI pair programming",
    "code quality",
    "static analysis",
    "AST parsing",
    "open source tools",
    "free developer tools",
    "AI collaboration"
  ],
  authors: [{ name: "aiready Team", url: "https://getaiready.dev" }],
  creator: "aiready",
  publisher: "aiready",
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
      { url: "/logo-transparent-bg.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-transparent-bg.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo-transparent-bg.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo-transparent-bg.png",
      },
    ],
  },
  openGraph: {
    title: "AIReady - Make Your Codebase AI-Ready",
    description: "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency.",
    url: "https://getaiready.dev",
    siteName: "aiready",
    images: [
      {
        url: "/api/og", // Dynamic OG image
        width: 1200,
        height: 630,
        alt: "aiready - AI-Ready Codebase Tools",
      },
      {
        url: "/logo-text.png", // Fallback
        width: 800,
        height: 400,
        alt: "aiready Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aiready - Make Your Codebase AI-Ready",
    description: "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.",
    images: ["/api/og"], // Dynamic OG image
    creator: "@aireadytools",
    site: "@aireadytools",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  classification: "Developer Tools",
  verification: {
    google: "google-site-verification-token", // TODO: Replace with actual token
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AIReady",
    "alternateName": "aiready",
    "url": "https://getaiready.dev",
    "logo": {
      "@type": "ImageObject",
      "url": "https://getaiready.dev/logo-transparent-bg.png",
      "width": "512",
      "height": "512"
    },
    "description": "Free tools to optimize your codebase for AI collaboration",
    "foundingDate": "2025",
    "sameAs": [
      "https://github.com/caopengau/aiready-cli",
      "https://www.npmjs.com/package/@aiready/cli",
      "https://twitter.com/aireadytools"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "url": "https://github.com/caopengau/aiready-cli/issues",
      "availableLanguage": ["English"]
    },
    "brand": {
      "@type": "Brand",
      "name": "AIReady"
    }
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AIReady CLI",
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Code Analysis Tool",
    "operatingSystem": ["Windows", "macOS", "Linux"],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "description": "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.",
    "softwareVersion": "1.0",
    "downloadUrl": "https://www.npmjs.com/package/@aiready/cli",
    "installUrl": "https://www.npmjs.com/package/@aiready/cli",
    "releaseNotes": "https://github.com/caopengau/aiready-cli/releases",
    "screenshot": "https://getaiready.dev/screenshot.png",
    "author": {
      "@type": "Organization",
      "name": "AIReady",
      "url": "https://getaiready.dev"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AIReady",
      "url": "https://getaiready.dev"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "2",
      "bestRating": "5",
      "worstRating": "1"
    },
    "keywords": "AI, codebase optimization, semantic analysis, context window, code consistency, developer tools",
    "programmingLanguage": [
      "TypeScript",
      "JavaScript"
    ],
    "codeRepository": "https://github.com/caopengau/aiready-cli"
  };

  return (
    <html lang="en">
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="software-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
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
