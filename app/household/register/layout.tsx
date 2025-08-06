import React from 'react';
import { FormProvider } from "./form-provider";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormProvider>
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-4">
            {children}
        </div>
        </main>
    </FormProvider>
  );
}
