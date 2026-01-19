import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OrgaWidgetClient } from "../components/OrgaWidgetClient";
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
  title: "Orga AI CDN | Conversational AI (voice & video) via @orga-ai/react",
  description:
    "Embed conversational AI with audio and video using the Orga AI CDN on top of @orga-ai/react. Requires your own backend service to exchange API keys for ephemeral tokens — open beta, no telemetry, no charge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <OrgaWidgetClient />
      </body>
    </html>
  );
}
