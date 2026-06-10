import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppScrollbars } from "@/components/ui/app-scrollbars";
import { ToastProvider } from "@/components/ui/toast";
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

const siteName = () => process.env.SITE_NAME ?? process.env.NEXT_PUBLIC_SITE_NAME ?? "Online Record";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 允许用户缩放（无障碍），但限制最大倍数避免误触双击放大
  maximumScale: 5,
  themeColor: "#02040a",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteName(),
    description: "要么极致，要么归零。",
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AppScrollbars />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
