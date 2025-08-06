'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong!</CardTitle>
              <CardDescription>
                We&apos;re sorry, but something unexpected happened. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Error ID: {error.digest}
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={reset} className="w-full">
                Try again
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
