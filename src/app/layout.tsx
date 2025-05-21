import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Anonyrant - Anonymous 24-Hour Rant Sharing Platform",
  description: "Share your thoughts anonymously on Anonyrant, where every rant disappears after 24 hours. Express yourself freely with reactions and comments in a supportive, ephemeral community.",
  keywords: [
    "anonymous rant",
    "temporary posts",
    "24 hour content",
    "anonymous social media",
    "vent platform",
    "ephemeral content",
    "anonymous sharing",
    "emotional support",
    "safe space",
    "daily venting",
    "anonymous community"
  ],
  openGraph: {
    title: "Anonyrant - Share Your Thoughts Freely",
    description: "A safe space for anonymous 24-hour rants, reactions, and supportive comments. Express yourself without judgment.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anonyrant - Anonymous 24-Hour Rant Sharing",
    description: "Share your thoughts anonymously, connect through reactions, and find support in a judgment-free space.",
  },
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
      </body>
    </html>
  );
}
