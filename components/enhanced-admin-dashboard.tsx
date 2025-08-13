'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Settings,
  FileText
} from 'lucide-react';
import { AdminDashboardAnalytics } from '@/components/admin-dashboard-analytics';
import { AdminTrainingManagement } from '@/components/admin-training-management';
import { ETATrackingComponent } from '@/components/eta-tracking';
import { IsangeReportingSystem } from '@/components/isange-reporting-system';
import { RwandanInsuranceSelection } from '@/components/rwandan-insurance-selection';
import { SystemMaintenanceReporting } from '@/components/system-maintenance-reporting';

interface EnhancedAdminDashboardProps {
  adminId: string;
}

export function EnhancedAdminDashboard({ adminId }: EnhancedAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const tabItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'training',
      label: 'Training',
      icon: <GraduationCap className="w-4 h-4" />
    },
    {
      id: 'eta-tracking',
      label: 'ETA Tracking',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'isange-reports',
      label: 'ISANGE Reports',
      icon: <Shield className="w-4 h-4" />
    },
    {
      id: 'insurance',
      label: 'Insurance',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive system management and analytics</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              System Status
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15,847</div>
                <p className="text-xs text-muted-foreground">
                  +18.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,923</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  156 active participants
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <AlertTriangle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            {tabItems.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center space-x-2"
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New worker registration</p>
                        <p className="text-xs text-gray-500">John Doe completed profile setup</p>
                      </div>
                      <span className="text-xs text-gray-400">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Training program completed</p>
                        <p className="text-xs text-gray-500">House Cleaning Basics - 12 participants</p>
                      </div>
                      <span className="text-xs text-gray-400">15 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">System maintenance scheduled</p>
                        <p className="text-xs text-gray-500">Database optimization at 2:00 AM</p>
                      </div>
                      <span className="text-xs text-gray-400">1 hour ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">ISANGE report submitted</p>
                        <p className="text-xs text-gray-500">Worker behavior incident reported</p>
                      </div>
                      <span className="text-xs text-gray-400">3 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Operational</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment Gateway</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Operational</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Notifications</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-yellow-600">Degraded</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ETA Tracking</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Operational</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab('training')}
                  >
                    <GraduationCap className="w-6 h-6" />
                    <span className="text-sm">Create Training</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab('maintenance')}
                  >
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">System Maintenance</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab('isange-reports')}
                  >
                    <Shield className="w-6 h-6" />
                    <span className="text-sm">ISANGE Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AdminDashboardAnalytics 
              dateRange={analyticsDateRange}
              // onDateRangeChange={setAnalyticsDateRange} // Removed prop to match AdminDashboardAnalyticsProps
            />
          </TabsContent>

          {/* Training Management Tab */}
          <TabsContent value="training">
            <AdminTrainingManagement />
          </TabsContent>

          {/* ETA Tracking Tab */}
          <TabsContent value="eta-tracking">
            <ETATrackingComponent 
              workerId={adminId}
              householdId={adminId}
              jobId="sample-job"
            />
          </TabsContent>

          {/* ISANGE Reports Tab */}
          <TabsContent value="isange-reports">
            <IsangeReportingSystem 
              userType="admin" 
              userId={adminId} 
            />
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance">
            <RwandanInsuranceSelection 
              workerId={adminId}
            />
          </TabsContent>

          {/* System Maintenance Tab */}
          <TabsContent value="maintenance">
            <SystemMaintenanceReporting adminId={adminId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
