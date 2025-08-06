
"use client";

import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CleanHandsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M16.15 8.93c.63-1.05.28-2.43-.8-3.14l-4.5-2.81c-1.08-.71-2.55-.42-3.23.73L3.13 11.8c-.68 1.15-.36 2.58.73 3.23l.28.18V21h2v-5.81l4.04-2.52l.24.43c.68 1.15 2.11 1.45 3.23.73zM7.85 13.07l4.04-6.57l1.94 1.21l-4.04 6.57zM18 13c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m2.41 4.59L19 19l-1.41-1.41L16.17 19l-1.41-1.41L17.59 16l-2.83-2.83l1.41-1.41L19 13.17l2.83-2.83l1.41 1.41z"></path></svg>
);

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"></path></svg>
);

const AdminPanelSettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M17 11c.34 0 .67.04 1 .09V6.27L12 3L6 6.27v4.81c0 5.05 3.41 9.76 8 10.91c-.05-.33-.09-.66-.09-1c0-2.68 1.6-5.02 4-6.06M17 13c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m-1.42 5.41L14.17 17l1.41-1.41L17 17.17l3.59-3.58L22 15z"></path></svg>
);


export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-background">
      <div className="w-full max-w-xs">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/worker/register" className="flex-1">
            <Card className="h-full group hover:shadow-lg transition-shadow duration-300 bg-primary/10 border-primary">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center gap-2">
                <CleanHandsIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <CardTitle className="text-sm font-semibold text-primary">Work</CardTitle>
              </CardContent>
            </Card>
          </Link>

          <Link href="/household/register" className="flex-1">
            <Card className="h-full group hover:shadow-lg transition-shadow duration-300 bg-secondary/10 border-secondary">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center gap-2">
                <HomeIcon className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />
                <CardTitle className="text-sm font-semibold text-secondary">Home</CardTitle>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/login" className="flex-1">
            <Card className="h-full group hover:shadow-lg transition-shadow duration-300 bg-accent/10 border-accent">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center gap-2">
                <AdminPanelSettingsIcon className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                <CardTitle className="text-sm font-semibold text-accent">Admin</CardTitle>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="text-center mt-6">
            <Button variant="link" asChild>
                <a href="https://househelp.app" target="_blank" rel="noopener noreferrer">Continue as Guest</a>
            </Button>
        </div>
      </div>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        <span className="mx-2">|</span>
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      </footer>
    </main>
  );
}
