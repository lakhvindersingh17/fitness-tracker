import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { FirebaseProvider } from "@/components/FirebaseProvider";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Fitness Tracker PWA',
  description: 'Offline-first Fitness and Diet Tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fitness Tracker',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans dark", inter.variable, jetbrainsMono.variable)}>
      <body className="bg-[#0A0C10] text-slate-200 min-h-screen pb-20 sm:pb-0 font-sans" suppressHydrationWarning>
        <div className="w-full sm:w-[390px] mx-auto bg-[#0A0C10] min-h-screen shadow-2xl relative shadow-black overflow-hidden sm:border-x sm:border-slate-800">
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
        </div>
      </body>
    </html>
  );
}
