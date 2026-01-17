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
  title: "aiready - Make Your Codebase AI-Ready",
  description: "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.",
  keywords: "AI, codebase, optimization, semantic analysis, context window, consistency, TypeScript, JavaScript, developer tools",
  authors: [{ name: "aiready Team" }],
  creator: "aiready",
  publisher: "aiready",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: "/logo-transparent-bg.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-transparent-bg.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo-transparent-bg.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "AIReady - Make Your Codebase AI-Ready",
    description: "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency.",
    url: "https://getaiready.dev",
    siteName: "aiready",
    images: [
      {
        url: "/logo-text.png",
        width: 1200,
        height: 630,
        alt: "aiready - AI-Ready Codebase Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aiready - Make Your Codebase AI-Ready",
    description: "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.",
    images: ["/logo-text.png"],
    creator: "@aireadytools",
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
    "url": "https://getaiready.dev",
    "logo": "https://getaiready.dev/logo-transparent-bg.png",
    "description": "Free tools to optimize your codebase for AI collaboration",
    "sameAs": [
      "https://github.com/caopengau/aiready-cli",
      "https://www.npmjs.com/package/@aiready/cli",
      "https://twitter.com/aireadytools"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "url": "https://github.com/caopengau/aiready-cli/issues"
    }
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AIReady CLI",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Windows, macOS, Linux",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.",
    "softwareVersion": "1.0",
    "downloadUrl": "https://www.npmjs.com/package/@aiready/cli",
    "author": {
      "@type": "Organization",
      "name": "AIReady"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "1"
    }
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
