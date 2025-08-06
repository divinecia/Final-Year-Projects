'use client';

import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(adminEmail)) {
      setMessage("Please enter a valid email address.");
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setMessage("Settings saved successfully!");
      setLoading(false);
      setTimeout(() => setMessage(null), 2500);
    }, 1000);
  };

  return (
        <section className="p-8">
      <h1 className="text-3xl font-semibold mb-4">Admin Settings</h1>
      <p className="text-gray-600">Manage your application settings below.</p>
      <form className="mt-8" onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-6">
          <label htmlFor="siteName" className="block mb-2 font-medium">
            Site Name
          </label>
          <input
            id="siteName"
            type="text"
            placeholder="Enter site name"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 text-base"
            required
            disabled={loading}
            maxLength={64}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="adminEmail" className="block mb-2 font-medium">
            Admin Email
          </label>
          <input
            id="adminEmail"
            type="email"
            placeholder="Enter admin email"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 text-base"
            required
            disabled={loading}
            maxLength={128}
          />
        </div>
        <button
          type="submit"
          className={`py-3 px-6 rounded font-medium text-white border-none min-w-30 transition-colors duration-200 ${
            loading 
              ? "bg-blue-300 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
        {message && (
          <div
            className={`mt-4 p-2 px-4 rounded text-sm border ${
              message.includes("success") 
                ? "text-blue-600 bg-blue-50 border-blue-200" 
                : "text-red-600 bg-red-50 border-red-200"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </form>
    </section>
  );
}
