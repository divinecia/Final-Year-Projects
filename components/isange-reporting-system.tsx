'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  FileText, 
  Send, 
  CheckCircle,
  Clock,
  Mail,
  Phone
} from 'lucide-react';
import { WorkerBehaviorReport } from '@/lib/types/enhanced-system';

interface IsangeReportingProps {
  userType: 'household' | 'worker' | 'admin';
  userId: string;
}

export function IsangeReportingSystem({ userId }: IsangeReportingProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  // Behavior report form state
  const [behaviorReport, setBehaviorReport] = useState({
    workerId: '',
    jobId: '',
    reportType: 'misconduct' as WorkerBehaviorReport['reportType'],
    category: 'behavior' as WorkerBehaviorReport['category'],
    title: '',
    description: '',
    severity: 'moderate' as WorkerBehaviorReport['severity'],
    actionRequested: '',
    witnessInfo: '',
    incidentDate: new Date().toISOString().split('T')[0] // Format for input[type="date"]
  });

  const [reports, setReports] = useState<WorkerBehaviorReport[]>([]);

  const handleBehaviorReportSubmit = async () => {
    setSubmissionStatus('submitting');
    
    try {
      const report: Omit<WorkerBehaviorReport, 'id' | 'createdAt' | 'updatedAt'> = {
        reportedBy: userId,
        workerId: behaviorReport.workerId,
        jobId: behaviorReport.jobId || 'current-job',
        reportType: behaviorReport.reportType,
        category: behaviorReport.category,
        title: behaviorReport.title,
        description: behaviorReport.description,
        severity: behaviorReport.severity,
        actionRequested: behaviorReport.actionRequested,
        witnessInfo: behaviorReport.witnessInfo || undefined,
        incidentDate: new Date(behaviorReport.incidentDate),
        status: 'submitted',
        isangeNotified: false
      };

      // Submit to Firestore
      const reportId = await submitBehaviorReport(report);
      
      // Send to Isange One Stop Center
      await notifyIsangeCenter(report, reportId);
      
      // Send copy to company
      await notifyCompany(report, reportId);
      
      setSubmissionStatus('success');
      
      // Reset form
      setBehaviorReport({
        workerId: '',
        jobId: '',
        reportType: 'misconduct',
        category: 'behavior',
        title: '',
        description: '',
        severity: 'moderate',
        actionRequested: '',
        witnessInfo: '',
        incidentDate: new Date().toISOString().split('T')[0]
      });
      
      setIsReportDialogOpen(false);
      
      // Reload reports
      loadReports();
    } catch (error) {
      console.error('Error submitting behavior report:', error);
      setSubmissionStatus('error');
    }
  };

  const submitBehaviorReport = async (report: Omit<WorkerBehaviorReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    // Submit to Firestore collection 'behavior_reports'
    const reportId = `behavior_${Date.now()}`;
    console.log('Submitting behavior report:', { id: reportId, ...report });
    return reportId;
  };

  const notifyIsangeCenter = async (report: Omit<WorkerBehaviorReport, 'id' | 'createdAt' | 'updatedAt'>, reportId: string) => {
    const emailData = {
      to: process.env.NEXT_PUBLIC_ISANGE_EMAIL || 'info1@kicukiro.gov.rw',
      subject: `Worker Behavior Report - ${report.title}`,
      body: `
        Dear ISANGE One Stop Center,

        We are reporting a worker behavior incident that requires your attention.

        Report Details:
        - Report ID: ${reportId}
        - Report Type: ${report.reportType}
        - Category: ${report.category}
        - Severity: ${report.severity}
        - Incident Date: ${report.incidentDate.toLocaleDateString()}
        
        Title: ${report.title}
        
        Description:
        ${report.description}
        
        Action Requested:
        ${report.actionRequested}
        
        ${report.witnessInfo ? `Witness Information:\n${report.witnessInfo}` : ''}
        
        Please investigate this matter and take appropriate action.
        
        Best regards,
        HouseHelp Support Team
        ${process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'support@househelp.app'}
      `
    };

    // Send email via your email service (SendGrid, etc.)
    console.log('Sending email to ISANGE:', emailData);
  };

  const notifyCompany = async (report: Omit<WorkerBehaviorReport, 'id' | 'createdAt' | 'updatedAt'>, reportId: string) => {
    const emailData = {
      to: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'support@househelp.app',
      subject: `ISANGE Report Copy - ${report.title}`,
      body: `
        Internal Copy: Worker Behavior Report

        Report ID: ${reportId}
        Report Type: ${report.reportType}
        Severity: ${report.severity}
        Status: Submitted to ISANGE

        This is a copy of the report sent to ISANGE One Stop Center for your records.
      `
    };

    console.log('Sending copy to company:', emailData);
  };

  const loadReports = React.useCallback(async () => {
    // Load existing reports from Firestore
    const mockReports: WorkerBehaviorReport[] = [
      {
        id: 'report-1',
        reportedBy: userId,
        workerId: 'worker-123',
        jobId: 'job-456',
        reportType: 'misconduct',
        category: 'behavior',
        title: 'Inappropriate conduct during service',
        description: 'Worker displayed unprofessional behavior and used inappropriate language.',
        severity: 'serious',
        actionRequested: 'Formal warning and additional training',
        incidentDate: new Date('2025-01-01'),
        status: 'under_review',
        isangeNotified: true,
        isangeReferenceNumber: 'ISANGE-2025-001',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      }
    ];
    setReports(mockReports);
  }, [userId]);

  const getStatusBadge = (status: WorkerBehaviorReport['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Under Review</Badge>;
      case 'escalated_to_isange':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Escalated to ISANGE</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ISANGE Reporting System</h1>
          <p className="text-gray-600 mt-1">Report worker behavior incidents to ISANGE One Stop Centers</p>
        </div>
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Worker Behavior Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workerId">Worker ID</Label>
                  <Input
                    id="workerId"
                    value={behaviorReport.workerId}
                    onChange={(e) => setBehaviorReport({ ...behaviorReport, workerId: e.target.value })}
                    placeholder="Enter worker ID"
                  />
                </div>
                <div>
                  <Label htmlFor="jobId">Job ID (Optional)</Label>
                  <Input
                    id="jobId"
                    value={behaviorReport.jobId}
                    onChange={(e) => setBehaviorReport({ ...behaviorReport, jobId: e.target.value })}
                    placeholder="Enter job ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select
                    value={behaviorReport.reportType}
                    onValueChange={(value: WorkerBehaviorReport['reportType']) =>
                      setBehaviorReport({ ...behaviorReport, reportType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="misconduct">Misconduct</SelectItem>
                      <SelectItem value="excellence">Excellence</SelectItem>
                      <SelectItem value="concern">Concern</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={behaviorReport.category}
                    onValueChange={(value: WorkerBehaviorReport['category']) =>
                      setBehaviorReport({ ...behaviorReport, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="punctuality">Punctuality</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="behavior">Behavior</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={behaviorReport.title}
                  onChange={(e) => setBehaviorReport({ ...behaviorReport, title: e.target.value })}
                  placeholder="Brief title of the incident"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={behaviorReport.description}
                  onChange={(e) => setBehaviorReport({ ...behaviorReport, description: e.target.value })}
                  placeholder="Detailed description of the incident"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={behaviorReport.severity}
                    onValueChange={(value: WorkerBehaviorReport['severity']) =>
                      setBehaviorReport({ ...behaviorReport, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="incidentDate">Incident Date</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={behaviorReport.incidentDate}
                    onChange={(e) => setBehaviorReport({ ...behaviorReport, incidentDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="actionRequested">Action Requested</Label>
                <Textarea
                  id="actionRequested"
                  value={behaviorReport.actionRequested}
                  onChange={(e) => setBehaviorReport({ ...behaviorReport, actionRequested: e.target.value })}
                  placeholder="What action would you like ISANGE to take?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="witnessInfo">Witness Information (Optional)</Label>
                <Textarea
                  id="witnessInfo"
                  value={behaviorReport.witnessInfo}
                  onChange={(e) => setBehaviorReport({ ...behaviorReport, witnessInfo: e.target.value })}
                  placeholder="Names and contact information of any witnesses"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBehaviorReportSubmit} disabled={submissionStatus === 'submitting'}>
                  {submissionStatus === 'submitting' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ISANGE Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            ISANGE One Stop Center Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Email:</span>
              <span>info1@kicukiro.gov.rw</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-green-500" />
              <span className="font-medium">Phone:</span>
              <span>+250 788 123 456</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ISANGE One Stop Centers provide comprehensive services for gender-based violence prevention and response, 
            child protection, and family services.
          </p>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reports submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{report.title}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                    <span>Type: {report.reportType}</span>
                    <span>Severity: {report.severity}</span>
                    <span>Date: {report.incidentDate.toLocaleDateString()}</span>
                    {report.isangeReferenceNumber && (
                      <span>Ref: {report.isangeReferenceNumber}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Status */}
      {submissionStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Report submitted successfully to ISANGE!
          </div>
        </div>
      )}

      {submissionStatus === 'error' && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Error submitting report. Please try again.
          </div>
        </div>
      )}
    </div>
  );
}
