
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { HouseholdFormData } from './schemas';

// Combine all step schemas into one type
export type FormData = Partial<HouseholdFormData>;

// Define the context type
interface FormContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

// Create the context with a default value
const FormContext = createContext<FormContextType | undefined>(undefined);

// Create the provider component
export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>({});

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
};

// Create a custom hook for using the form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
