import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InOptics Admin Panel",
  description: "InOptics Exhibition Management System",
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
