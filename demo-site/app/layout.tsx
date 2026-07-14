import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEWSROOM AI｜每日新聞與話術 Agent",
  description: "可追溯、可檢核的每日重要新聞摘要與客群溝通素材。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
