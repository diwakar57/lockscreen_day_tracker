import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lock Screen Widget Generator",
  description: "Generate a dynamic dot-grid wallpaper for your iPhone 15 Pro lock screen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
