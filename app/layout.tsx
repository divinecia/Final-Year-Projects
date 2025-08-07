import React from 'react';
import { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Househelp',
  description: 'Connecting you to trusted home services in Rwanda.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Househelp',
  },
  icons: {
    apple: "/icons/icon.png",
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#225590',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-inter antialiased bg-background")} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
