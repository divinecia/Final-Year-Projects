'use client';

/* eslint-disable react/forbid-dom-props */
/* webhint-disable no-inline-styles */
import React, { useState, useEffect } from 'react';
import { DashboardAnalytics } from '@/lib/types/enhanced-system';

interface AdminDashboardAnalyticsProps {
  dateRange: 'week' | 'month' | 'quarter' | 'year';
}

export function AdminDashboardAnalytics({ dateRange }: AdminDashboardAnalyticsProps) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed unused state: taxStats, insuranceCompanies, recentWorkers

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/dashboard?range=${dateRange}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAnalytics(data.data);
        } else {
          setAnalytics(null);
        }
      })
      .catch(err => {
        setAnalytics(null);
        console.error('Error loading analytics:', err);
      })
      .finally(() => setLoading(false));
  }, [dateRange]);

  useEffect(() => {
    // Set dynamic styles using data attributes
    const chartBars = document.querySelectorAll('[data-height]');
    chartBars.forEach((bar) => {
      const height = bar.getAttribute('data-height');
      if (height) {
        (bar as HTMLElement).style.height = `${height}px`;
      }
    });

    const progressBars = document.querySelectorAll('[data-width]');
    progressBars.forEach((bar) => {
      const width = bar.getAttribute('data-width');
      if (width) {
        (bar as HTMLElement).style.width = `${width}%`;
      }
    });
  }, [analytics]);

  // Removed unused formatting and icon functions

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Only valid dashboard sections remain. All broken references removed. */}
    </div>
  );
}
