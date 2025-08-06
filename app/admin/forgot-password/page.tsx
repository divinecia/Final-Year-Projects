'use client';

import React, { useState } from 'react';
import { Mail, Phone as PhoneIcon, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminForgotPasswordPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Basic validation for email and phone
  const validateInput = () => {
    if (method === 'email') {
      // Simple email regex
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    } else {
      // Simple phone regex (10-15 digits)
      return /^\d{10,15}$/.test(value.replace(/\D/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateInput()) {
      setError(method === 'email' ? 'Please enter a valid email address.' : 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [method]: value }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Password reset instructions sent.');
        setValue('');
      } else {
        setError(data.error || 'Failed to send reset instructions.');
      }
    } catch {
      setError('Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-8 bg-white rounded-2xl shadow-lg border border-blue-100 animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-2 text-center text-blue-700 flex items-center justify-center gap-2">
        <span>Admin Password Reset</span>
      </h1>
      <p className="text-center text-gray-500 mb-6">Choose how to receive your reset instructions.</p>
      <fieldset className="mb-6">
        <legend className="sr-only">Choose password reset method</legend>
        <div className="flex gap-2">
          <label className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium border transition-colors duration-150 cursor-pointer ${method === 'email' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}>
            <input
              type="radio"
              name="resetMethod"
              value="email"
              checked={method === 'email'}
              onChange={() => { setMethod('email'); setValue(''); setError(''); setMessage(''); }}
              className="sr-only"
            />
            <Mail className="w-5 h-5" /> Email
          </label>
          <label className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium border transition-colors duration-150 cursor-pointer ${method === 'phone' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}>
            <input
              type="radio"
              name="resetMethod"
              value="phone"
              checked={method === 'phone'}
              onChange={() => { setMethod('phone'); setValue(''); setError(''); setMessage(''); }}
              className="sr-only"
            />
            <PhoneIcon className="w-5 h-5" /> Phone
          </label>
        </div>
      </fieldset>
      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <label className="block">
          <span className="block mb-1 font-semibold text-gray-700">
            {method === 'email' ? 'Admin Email' : 'Admin Phone'}
          </span>
          <div className="relative">
            <input
              type={method === 'email' ? 'email' : 'tel'}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg pr-12 transition-all"
              placeholder={method === 'email' ? 'Enter your admin email' : 'Enter your admin phone'}
              value={value}
              onChange={e => setValue(e.target.value)}
              required
              autoFocus
              inputMode={method === 'email' ? 'email' : 'tel'}
              pattern={method === 'email' ? undefined : '\\d{10,15}'}
              disabled={loading}
              aria-label={method === 'email' ? 'Admin Email' : 'Admin Phone'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {method === "email" ? <Mail className="w-5 h-5" /> : <PhoneIcon className="w-5 h-5" />}
            </span>
          </div>
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-colors duration-150 shadow"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
      {message && (
        <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mt-6 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mt-6 animate-fade-in">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
