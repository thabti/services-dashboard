import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Services Dashboard | Multi-Service Sales Analytics",
  description: "Dashboard for managing nannies, car seats, and home care services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
