"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TrainingForm } from "./training-form";
import { 
  getTrainings, 
  getTrainingRequests, 
  approveTrainingRequest, 
  rejectTrainingRequest,
  type TrainingProgram,
  type TrainingRequest 
} from "./actions";
import { checkFirebaseConnection } from "@/lib/firebase";

export default function AdminTrainingPage() {
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setConnectionError(null);
    try {
      const connected = await checkFirebaseConnection();
      if (!connected) {
        setConnectionError("Could not connect to Firestore. Please check your Firebase configuration and network.");
        setTrainings([]);
        setTrainingRequests([]);
        return;
      }
      const [trainingsData, requestsData] = await Promise.all([
        getTrainings(),
        getTrainingRequests()
      ]);
      setTrainings(trainingsData);
      setTrainingRequests(requestsData);
    } catch (err: unknown) {
      const errorMessage = typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message
        : "Failed to load training data.";
      setConnectionError(errorMessage || "Failed to load training data.");
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage || "Failed to load training data."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      const result = await approveTrainingRequest(requestId);
      if (result.success) {
        toast({
          title: "Request Approved",
          description: "Training request has been approved."
        });
        fetchData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to approve request."
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve training request."
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const result = await rejectTrainingRequest(requestId, "Request rejected by admin");
      if (result.success) {
        toast({
          title: "Request Rejected",
          description: "Training request has been rejected."
        });
        fetchData();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to reject request."
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject training request."
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="space-y-6">
        <div className="text-red-600 font-bold">{connectionError}</div>
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Management</h1>
          <p className="text-muted-foreground">Manage training programs and worker requests.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Training Program
        </Button>
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Training Programs</TabsTrigger>
          <TabsTrigger value="requests">
            Worker Requests 
            {trainingRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {trainingRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>Available Training Programs</CardTitle>
              <CardDescription>Manage training programs for workers.</CardDescription>
            </CardHeader>
            <CardContent>
              {trainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No training programs available. Create one to get started.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trainings.map((training) => (
                    <Card key={training.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{training.title}</CardTitle>
                        <Badge variant="secondary">{training.category}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Duration: {training.duration}
                        </p>
                        <p className="text-sm">{training.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Training Requests from Workers</CardTitle>
              <CardDescription>Review and approve worker training requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {trainingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No training requests yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Training Program</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.workerName}</p>
                            <p className="text-sm text-muted-foreground">{request.workerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{request.trainingTitle}</TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TrainingForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onFormSubmit={fetchData}
      />
    </div>
  );
}