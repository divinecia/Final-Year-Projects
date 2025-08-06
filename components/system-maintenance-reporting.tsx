'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings, 
  Server,
  Database,
  Wifi,
  Shield,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { SystemMaintenanceReport } from '@/lib/types/enhanced-system';
import styles from './system-maintenance-reporting.module.css';

interface SystemMaintenanceReportingProps {
  adminId: string;
}

export function SystemMaintenanceReporting({ adminId }: SystemMaintenanceReportingProps) {
  const [reports, setReports] = useState<SystemMaintenanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'system' as 'system' | 'database' | 'network' | 'security' | 'performance' | 'ui' | 'api',
    affectedSystems: [] as string[],
    estimatedDuration: '',
    scheduledStart: '',
    scheduledEnd: ''
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      // This would fetch real maintenance reports from Firestore
      const mockReports: SystemMaintenanceReport[] = [
        {
          id: 'maint-001',
          title: 'Database Performance Optimization',
          description: 'Optimize Firestore queries and indexes to improve response times',
          category: 'database',
          priority: 'high',
          status: 'in-progress',
          affectedSystems: ['Firestore Database', 'Worker Search', 'Job Matching'],
          reportedBy: adminId,
          reportedAt: new Date('2025-01-01T10:00:00Z'),
          assignedTo: 'system-admin',
          estimatedDuration: '4 hours',
          scheduledStart: new Date('2025-01-01T22:00:00Z'),
          scheduledEnd: new Date('2025-01-02T02:00:00Z'),
          actualStart: new Date('2025-01-01T22:00:00Z'),
          progress: 60,
          userImpact: 'Temporary slower search results',
          maintenanceSteps: [
            {
              stepNumber: 1,
              description: 'Backup current database',
              status: 'completed',
              completedAt: new Date('2025-01-01T22:30:00Z')
            },
            {
              stepNumber: 2,
              description: 'Update Firestore indexes',
              status: 'in-progress'
            },
            {
              stepNumber: 3,
              description: 'Optimize complex queries',
              status: 'pending'
            },
            {
              stepNumber: 4,
              description: 'Performance testing',
              status: 'pending'
            }
          ],
          communicationsSent: [
            {
              type: 'users',
              message: 'System maintenance in progress. You may experience slower search results.',
              sentAt: new Date('2025-01-01T21:45:00Z')
            }
          ]
        },
        {
          id: 'maint-002',
          title: 'Security Certificate Renewal',
          description: 'Renew SSL certificates for all domains',
          category: 'security',
          priority: 'critical',
          status: 'pending',
          affectedSystems: ['Web Application', 'API Gateway', 'Payment Processing'],
          reportedBy: adminId,
          reportedAt: new Date('2025-01-01T09:00:00Z'),
          estimatedDuration: '2 hours',
          scheduledStart: new Date('2025-01-02T02:00:00Z'),
          scheduledEnd: new Date('2025-01-02T04:00:00Z'),
          userImpact: 'Brief service interruption during certificate update',
          maintenanceSteps: [
            {
              stepNumber: 1,
              description: 'Generate new certificates',
              status: 'pending'
            },
            {
              stepNumber: 2,
              description: 'Update load balancer configuration',
              status: 'pending'
            },
            {
              stepNumber: 3,
              description: 'Verify HTTPS connectivity',
              status: 'pending'
            }
          ]
        },
        {
          id: 'maint-003',
          title: 'Payment System Upgrade',
          description: 'Update Paypack integration to latest API version',
          category: 'api',
          priority: 'medium',
          status: 'completed',
          affectedSystems: ['Payment Processing', 'Worker Earnings', 'Invoice Generation'],
          reportedBy: adminId,
          reportedAt: new Date('2024-12-28T14:00:00Z'),
          assignedTo: 'system-admin',
          estimatedDuration: '3 hours',
          scheduledStart: new Date('2024-12-30T01:00:00Z'),
          scheduledEnd: new Date('2024-12-30T04:00:00Z'),
          actualStart: new Date('2024-12-30T01:00:00Z'),
          actualEnd: new Date('2024-12-30T03:30:00Z'),
          progress: 100,
          userImpact: 'No impact - completed during low usage hours',
          resolution: 'Successfully upgraded to Paypack API v2.1. All payment flows tested and verified.',
          maintenanceSteps: [
            {
              stepNumber: 1,
              description: 'Test new API in staging',
              status: 'completed',
              completedAt: new Date('2024-12-30T01:30:00Z')
            },
            {
              stepNumber: 2,
              description: 'Deploy API update',
              status: 'completed',
              completedAt: new Date('2024-12-30T02:30:00Z')
            },
            {
              stepNumber: 3,
              description: 'Verify payment processing',
              status: 'completed',
              completedAt: new Date('2024-12-30T03:30:00Z')
            }
          ],
          communicationsSent: [
            {
              type: 'users',
              message: 'Payment system maintenance completed successfully.',
              sentAt: new Date('2024-12-30T04:00:00Z')
            }
          ]
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error loading maintenance reports:', error);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleCreateReport = async () => {
    try {
      const newReport: SystemMaintenanceReport = {
        id: `maint-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        affectedSystems: formData.affectedSystems,
        reportedBy: adminId,
        reportedAt: new Date(),
        estimatedDuration: formData.estimatedDuration,
        scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart) : undefined,
        scheduledEnd: formData.scheduledEnd ? new Date(formData.scheduledEnd) : undefined,
        progress: 0,
        userImpact: 'Impact assessment pending',
        maintenanceSteps: []
      };

      // This would save to Firestore
      setReports([newReport, ...reports]);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating maintenance report:', error);
    }
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<SystemMaintenanceReport>) => {
    try {
      // This would update in Firestore
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, ...updates } : report
      ));
    } catch (error) {
      console.error('Error updating maintenance report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      // This would delete from Firestore
      setReports(reports.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error deleting maintenance report:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'system',
      affectedSystems: [],
      estimatedDuration: '',
      scheduledStart: '',
      scheduledEnd: ''
    });
  };

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  );

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'network':
        return <Wifi className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'system':
        return <Server className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold">System Maintenance</h1>
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={(value: 'all' | 'pending' | 'in-progress' | 'completed') => setFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Maintenance Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter maintenance title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the maintenance work"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value: 'system' | 'database' | 'network' | 'security' | 'performance' | 'ui' | 'api') => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="ui">User Interface</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                  <Input
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
                    placeholder="e.g., 2 hours, 30 minutes"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledStart">Scheduled Start</Label>
                    <Input
                      id="scheduledStart"
                      type="datetime-local"
                      value={formData.scheduledStart}
                      onChange={(e) => setFormData({...formData, scheduledStart: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledEnd">Scheduled End</Label>
                    <Input
                      id="scheduledEnd"
                      type="datetime-local"
                      value={formData.scheduledEnd}
                      onChange={(e) => setFormData({...formData, scheduledEnd: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReport}>
                    Create Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  {getCategoryIcon(report.category)}
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(report.priority)}
                  {getStatusBadge(report.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium capitalize">{report.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <p className="font-medium capitalize">{report.priority}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{report.estimatedDuration}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Progress:</span>
                    <p className="font-medium">{report.progress || 0}%</p>
                  </div>
                </div>

                {/* Affected Systems */}
                {report.affectedSystems.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Affected Systems:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {report.affectedSystems.map((system, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {(report.scheduledStart || report.scheduledEnd) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {report.scheduledStart && (
                      <div>
                        <span className="text-gray-500">Scheduled Start:</span>
                        <p className="font-medium">
                          {new Date(report.scheduledStart).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {report.scheduledEnd && (
                      <div>
                        <span className="text-gray-500">Scheduled End:</span>
                        <p className="font-medium">
                          {new Date(report.scheduledEnd).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                {report.status === 'in-progress' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{report.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-blue-500 h-2 rounded-full transition-all duration-300 ${styles.progressBar}`}
                        data-progress={report.progress}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Maintenance Steps */}
                {report.maintenanceSteps && report.maintenanceSteps.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 mb-2 block">Maintenance Steps:</span>
                    <div className="space-y-2">
                      {report.maintenanceSteps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : step.status === 'in-progress' ? (
                            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={step.status === 'completed' ? 'line-through text-gray-500' : ''}>
                            {step.stepNumber}. {step.description}
                          </span>
                          {step.completedAt && (
                            <span className="text-xs text-gray-400">
                              (completed {new Date(step.completedAt).toLocaleString()})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Impact */}
                {report.userImpact && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800">User Impact:</span>
                    <p className="text-sm text-yellow-700 mt-1">{report.userImpact}</p>
                  </div>
                )}

                {/* Resolution */}
                {report.resolution && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">Resolution:</span>
                    <p className="text-sm text-green-700 mt-1">{report.resolution}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  {report.status !== 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateReport(report.id, { 
                        status: report.status === 'pending' ? 'in-progress' : 'completed',
                        progress: report.status === 'pending' ? 25 : 100
                      })}
                    >
                      {report.status === 'pending' ? 'Start' : 'Complete'}
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance reports</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No maintenance reports have been created yet.' 
                  : `No ${filter} maintenance reports found.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
