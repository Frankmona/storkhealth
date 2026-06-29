import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { TopNavigation } from "@/components/TopNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storkfort Health | Certificate Verification",
  description: "Verify fitness certificates issued by Storkfort Health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} animate-fade-in`}>
        <AuthProvider>

          <TopNavigation />

          <main style={{ minHeight: 'calc(100vh - 56px)' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
