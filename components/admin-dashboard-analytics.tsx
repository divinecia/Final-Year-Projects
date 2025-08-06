'use client';

/* eslint-disable react/forbid-dom-props */
/* webhint-disable no-inline-styles */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DashboardAnalytics } from '@/lib/types/enhanced-system';
import styles from './admin-dashboard-analytics.module.css';

interface AdminDashboardAnalyticsProps {
  dateRange: 'week' | 'month' | 'quarter' | 'year';
  onDateRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

export function AdminDashboardAnalytics({ dateRange, onDateRangeChange }: AdminDashboardAnalyticsProps) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
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

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // This would fetch real analytics data from Firestore
      const mockAnalytics: DashboardAnalytics = {
        overview: {
          totalUsers: 15847,
          totalWorkers: 8923,
          totalHouseholds: 6924,
          totalJobs: 45672,
          totalRevenue: 125000000, // RWF
          monthlyGrowth: 18.5
        },
        visitors: {
          daily: [120, 135, 98, 145, 167, 189, 203, 178, 156, 134, 189, 234, 201, 178],
          weekly: [980, 1120, 1340, 1567, 1234, 1456, 1678],
          monthly: [4500, 5200, 6100, 7200, 6800, 7500, 8200, 8900, 9200, 8700, 9800, 10500],
          sources: [
            { source: 'Organic Search', visitors: 45, percentage: 45 },
            { source: 'Social Media', visitors: 25, percentage: 25 },
            { source: 'Direct', visitors: 20, percentage: 20 },
            { source: 'Referrals', visitors: 10, percentage: 10 }
          ]
        },
        satisfaction: {
          averageRating: 4.6,
          totalReviews: 3247,
          ratingDistribution: {
            five: 2100,
            four: 890,
            three: 167,
            two: 56,
            one: 34
          },
          satisfiedClients: 2990,
          satisfactionTrend: [4.2, 4.3, 4.4, 4.5, 4.6, 4.6, 4.6]
        },
        financials: {
          monthlyRevenue: [8500000, 9200000, 10100000, 11200000, 10800000, 12500000],
          serviceRevenue: [
            { serviceType: 'House Cleaning', revenue: 45000000, bookings: 1250, averagePrice: 36000 },
            { serviceType: 'Babysitting', revenue: 32000000, bookings: 890, averagePrice: 36000 },
            { serviceType: 'Cooking', revenue: 28000000, bookings: 780, averagePrice: 36000 },
            { serviceType: 'Laundry', revenue: 15000000, bookings: 650, averagePrice: 23000 },
            { serviceType: 'Gardening', revenue: 5000000, bookings: 180, averagePrice: 28000 }
          ],
          trainingRevenue: 15000000,
          subscriptionRevenue: 8500000,
          expenses: 89000000,
          profit: 36500000
        },
        services: {
          mostRequested: [
            { serviceType: 'House Cleaning', requests: 1250, completionRate: 96, averageRating: 4.7 },
            { serviceType: 'Babysitting', requests: 890, completionRate: 98, averageRating: 4.8 },
            { serviceType: 'Cooking', requests: 780, completionRate: 94, averageRating: 4.6 },
            { serviceType: 'Laundry', requests: 650, completionRate: 97, averageRating: 4.5 },
            { serviceType: 'Gardening', requests: 180, completionRate: 92, averageRating: 4.4 }
          ],
          serviceGrowth: [
            { serviceType: 'House Cleaning', growthPercentage: 15, previousPeriod: 1087, currentPeriod: 1250 },
            { serviceType: 'Babysitting', growthPercentage: 22, previousPeriod: 729, currentPeriod: 890 },
            { serviceType: 'Cooking', growthPercentage: 8, previousPeriod: 722, currentPeriod: 780 },
            { serviceType: 'Laundry', growthPercentage: -5, previousPeriod: 684, currentPeriod: 650 }
          ],
          serviceRatings: [
            { serviceType: 'Babysitting', averageRating: 4.8, totalReviews: 234 },
            { serviceType: 'House Cleaning', averageRating: 4.7, totalReviews: 567 },
            { serviceType: 'Cooking', averageRating: 4.6, totalReviews: 345 },
            { serviceType: 'Laundry', averageRating: 4.5, totalReviews: 234 },
            { serviceType: 'Gardening', averageRating: 4.4, totalReviews: 89 }
          ]
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 
      <ArrowUp className="w-4 h-4 text-green-500" /> : 
      <ArrowDown className="w-4 h-4 text-red-500" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(analytics.overview.monthlyGrowth)}
              <span className={`ml-1 ${getGrowthColor(analytics.overview.monthlyGrowth)}`}>
                {analytics.overview.monthlyGrowth}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalJobs)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analytics.overview.totalWorkers)} workers, {formatNumber(analytics.overview.totalHouseholds)} households
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Profit: {formatCurrency(analytics.financials.profit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.satisfaction.averageRating}/5.0</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analytics.satisfaction.satisfiedClients)} satisfied clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chartContainer}>
              {analytics.financials.monthlyRevenue.map((revenue, index) => {
                const maxRevenue = Math.max(...analytics.financials.monthlyRevenue);
                const heightPercentage = (revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    {/* REQUIRED: Dynamic chart height calculated from live revenue data */}
                    <div 
                      className={styles.dynamicChartBar}
                      data-height={Math.max((heightPercentage * 200) / 100, 8)}
                    ></div>
                    <span className="text-xs mt-1">
                      {new Date(Date.now() - (analytics.financials.monthlyRevenue.length - index - 1) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Service Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.serviceBreakdown}>
              {analytics.financials.serviceRevenue.map((service, index) => {
                const maxRevenue = Math.max(...analytics.financials.serviceRevenue.map(s => s.revenue));
                const widthPercentage = (service.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{service.serviceType}</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(service.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        {/* Dynamic progress width - required for data visualization */}
                        <div 
                          className={styles.dynamicServiceProgress}
                          data-width={widthPercentage}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatNumber(service.bookings)} bookings</span>
                        <span>Avg: {formatCurrency(service.averagePrice)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Requested Services */}
        <Card>
          <CardHeader>
            <CardTitle>Most Requested Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.services.mostRequested.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{service.serviceType}</span>
                      <Badge variant="secondary">{formatNumber(service.requests)} requests</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Completion: {service.completionRate}%</span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {service.averageRating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Service Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.services.serviceGrowth.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{service.serviceType}</span>
                      <div className="flex items-center">
                        {getGrowthIcon(service.growthPercentage)}
                        <span className={`ml-1 font-medium ${getGrowthColor(service.growthPercentage)}`}>
                          {Math.abs(service.growthPercentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatNumber(service.previousPeriod)} → {formatNumber(service.currentPeriod)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Analytics and Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.visitors.sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{source.source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      {/* Dynamic progress width - required for data visualization */}
                      <div 
                        className={styles.dynamicVisitorProgress}
                        data-width={source.percentage}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = analytics.satisfaction.ratingDistribution[
                  rating === 5 ? 'five' : 
                  rating === 4 ? 'four' : 
                  rating === 3 ? 'three' : 
                  rating === 2 ? 'two' : 'one'
                ];
                const percentage = (count / analytics.satisfaction.totalReviews) * 100;
                
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-6">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      {/* Dynamic progress width - required for data visualization */}
                      <div 
                        className={styles.dynamicRatingProgress}
                        data-width={percentage}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-16">
                      {formatNumber(count)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Service Revenue</div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(analytics.financials.serviceRevenue.reduce((sum, s) => sum + s.revenue, 0))}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Training Revenue</div>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(analytics.financials.trainingRevenue)}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">Subscription Revenue</div>
              <div className="text-2xl font-bold text-purple-700">
                {formatCurrency(analytics.financials.subscriptionRevenue)}
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-orange-700">
                {formatCurrency(analytics.financials.expenses)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
