import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Casper blog",
  description: "Markdown blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider>
          <Header/>
          <main className="min-h-screen">{children}</main>
          <Footer/>
        </ThemeProvider>
      </body>
    </html>
  );
}
