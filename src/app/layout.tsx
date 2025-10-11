import type { Metadata } from "next";
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
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-white text-black h-screen relative">
        {children}
      </body>
    </html>
  );
}