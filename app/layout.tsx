import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppScrollbars } from "@/components/ui/app-scrollbars";
import "overlayscrollbars/overlayscrollbars.css";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? "Online Record",
  description: "一个星际粒子网络风格的在线留言墙。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AppScrollbars />
        {children}
      </body>
    </html>
  );
}
