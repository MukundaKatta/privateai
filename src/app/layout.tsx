import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrivateAI — Local OpenAI API Replacement",
  description: "Serve local models with OpenAI-compatible API, model switching, and usage monitoring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
