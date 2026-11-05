import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();

  const general = data?.value || {};
  const faviconUrl = general.favicon_url || "/favicon.ico";
  const websiteName = general.website_name || "Pure Pour Co.";
  const tagline = general.tagline || "Artisanal Single-Origin Teas";

  return {
    title: `${websiteName} — ${tagline}`,
    description:
      "Pure Pour Co. crafts small-batch, single-origin teas and pure botanical blends sourced directly from mountain gardens with garden-fresh purity.",
    icons: {
      icon: [
        {
          url: faviconUrl,
          sizes: "any",
        },
      ],
      shortcut: [faviconUrl],
      apple: [faviconUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();

  const general = data?.value || {};
  const faviconUrl = general.favicon_url || "/favicon.ico";

  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="icon" href={faviconUrl} sizes="any" />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
