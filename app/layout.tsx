import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/layout/Providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Clang E-Cards",
  description: "Create and share personalised e-cards",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
