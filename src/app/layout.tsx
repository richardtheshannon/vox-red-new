import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icon Border Template",
  description: "Icon border layout with fixed positioning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=optional"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&display=optional"
        />
        <link
          rel="stylesheet"
          href="/essential-audio-player/essential_audio.css"
        />
      </head>
      <body className="bg-white text-black h-screen relative">
        {children}
        <Script
          src="/essential-audio-player/essential_audio.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}