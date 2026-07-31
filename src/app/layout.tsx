import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "لوحة تحكم هيازة فايندر",
  description: "لوحة التحكم الإدارية لنظام هيازة فايندر",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
