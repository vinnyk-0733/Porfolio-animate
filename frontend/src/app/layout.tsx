import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageNavigation } from "@/components/ui/page-navigation";
import { SocialQuadrantMenu } from "@/components/ui/circle-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinaya Kumar | AI & ML Portfolio",
  description: "Portfolio of Vinaya Kumar — AI & Machine Learning developer specializing in Python, Deep Learning, and Generative AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <PageNavigation />
        <SocialQuadrantMenu />
      </body>
    </html>
  );
}
