import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tacoma Eats - Restaurant Guide",
  description: "Your guide to dining in Tacoma/Pierce County",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
