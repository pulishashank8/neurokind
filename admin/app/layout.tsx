import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroKid Admin Dashboard",
  description: "Admin dashboard for NeuroKid platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
