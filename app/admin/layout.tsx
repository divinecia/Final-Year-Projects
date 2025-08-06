"use client"

import React from 'react';
import { AuthProvider } from "@/hooks/use-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow p-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
        <footer className="bg-white shadow p-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Househelp. All rights reserved.
        </footer>
      </div>
    </AuthProvider>
  );
}
