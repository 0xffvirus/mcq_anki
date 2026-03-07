import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans", weight: ["300", "400", "500", "600", "700"] });
import "./globals.css";

export const metadata: Metadata = {
  title: "MCQ Flash",
  description: "Spaced repetition MCQ flashcard app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MCQ Flash",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    // When a new SW is waiting, reload all clients immediately
                    reg.addEventListener('updatefound', function() {
                      var newWorker = reg.installing;
                      newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'activated') {
                          window.location.reload();
                        }
                      });
                    });
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground font-sans">
        <div className="mx-auto max-w-[390px] min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
