import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "next-themes";

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
    <html suppressHydrationWarning={true}>
      <head/>
      <body>
        <ThemeProvider>
          <Header/>
          <main className="min-h-screen">{children}</main>
          <Footer/>
        </ThemeProvider>
      </body>
    </html>
  );
}
