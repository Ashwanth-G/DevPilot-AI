import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

/**
 * ============================================================
 * Fonts
 * ============================================================
 *
 * Geist
 * → Main UI/application font.
 *
 * Inter
 * → General-purpose interface font.
 *
 * JetBrains Mono
 * → Code, logs, terminal output, and technical content.
 *
 * The `variable` option exposes each font as a CSS variable
 * that can be used throughout the application.
 */

// ─── Geist ───────────────────────────────────────────────────

// ─── Inter ───────────────────────────────────────────────────

// ─── JetBrains Mono ──────────────────────────────────────────

/**
 * ============================================================
 * SEO Metadata
 * ============================================================
 */

export const metadata: Metadata = {
  title: {
    default: "DevPilot AI — AI-Powered DevOps Assistant",
    template: "%s | DevPilot AI",
  },

  description:
    "DevPilot AI is an AI-powered DevOps operations platform. Ask questions, investigate failures, perform root cause analysis, and execute remediation — all from one intelligent dashboard.",

  keywords: [
    "DevOps",
    "AI",
    "MCP",
    "Model Context Protocol",
    "Kubernetes",
    "Docker",
    "GitHub",
    "monitoring",
    "incident management",
    "root cause analysis",
  ],

  authors: [
    {
      name: "DevPilot AI Team",
    },
  ],

  creator: "DevPilot AI",

  /**
   * Open Graph metadata.
   *
   * Used when DevPilot AI links are shared on platforms
   * such as LinkedIn, Discord, Facebook, etc.
   */

  openGraph: {
    type: "website",
    locale: "en-US",

    // Replace this with your real production domain later.
    url: "https://devpilot.ai",

    title: "DevPilot AI — AI-Powered DevOps Assistant",

    description:
      "Investigate failures, correlate logs, and execute fixes across GitHub, Docker, Kubernetes, and AWS — all in plain English.",

    siteName: "DevPilot AI",
  },

  /**
   * Twitter / X metadata.
   */

  twitter: {
    card: "summary_large_image",
    title: "DevPilot AI",
    description: "AI-Powered DevOps Operations Platform",
    creator: "@devpilotai",
  },

  /**
   * Search-engine crawling configuration.
   */

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
    },
  },
};

/**
 * ============================================================
 * Viewport
 * ============================================================
 *
 * Controls browser viewport behavior and browser theme color.
 */

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0d1117",
    },
    {
      media: "(prefers-color-scheme: light)",
      color: "#f5f7fa",
    },
  ],

  width: "device-width",
  initialScale: 1,
};

/**
 * ============================================================
 * Root Layout
 * ============================================================
 *
 * This is the root layout for the entire Next.js application.
 *
 * Structure:
 *
 * html
 * └── body
 *     └── Providers
 *         └── Application
 *
 * `suppressHydrationWarning` is intentional because
 * next-themes modifies the HTML class on the client.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
