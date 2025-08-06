"use client"

import { ReactNode } from 'react';
import { AuthProvider } from "@/hooks/use-auth";

export default function WorkerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="worker-layout">
        {children}
      </div>
    </AuthProvider>
  );
}
