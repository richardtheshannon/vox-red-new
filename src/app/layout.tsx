import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "lilde.com | spiritual growth",
  description: "Spiritual content platform with slide-based navigation",
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
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Open+Sans:wght@300;400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="/essential-audio-player/essential_audio.css"
        />
      </head>
      <body className="h-screen relative">
        {children}
        <Script
          src="/essential-audio-player/essential_audio.js"
          strategy="beforeInteractive"
        />
        <Script id="font-loading-fix" strategy="afterInteractive">
          {`
            // Ensure Material Symbols font loads properly
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(() => {
                // Force repaint to show icons after font loads
                document.body.style.display = 'none';
                document.body.offsetHeight; // Trigger reflow
                document.body.style.display = '';
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}