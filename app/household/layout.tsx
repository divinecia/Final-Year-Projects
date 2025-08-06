"use client"

import { ReactNode } from 'react';
import { AuthProvider } from "@/hooks/use-auth";

export default function HouseholdLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="household-layout">
        {children}
      </div>
    </AuthProvider>
  );
}
