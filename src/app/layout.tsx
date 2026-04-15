import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InOptics - India’s #1 Exhibition on Optics",
  description: "InOptics - India’s #1 Exhibition on Optics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
