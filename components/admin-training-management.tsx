'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import { TrainingProgram, TrainingRequest, TrainingSession } from '@/lib/types/enhanced-system';

export function AdminTrainingManagement() {
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingProgram | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state for creating/editing training
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    maxParticipants: 0,
    instructor: '',
    cost: 0,
    requirements: '',
    materials: '',
    startDate: '',
    endDate: '',
    sessions: [] as Omit<TrainingSession, 'id' | 'attendance'>[]
  });

  useEffect(() => {
    loadTrainings();
    loadTrainingRequests();
  }, []);

  const loadTrainings = async () => {
    try {
      // Fetch trainings from Firestore
      // This would be implemented with actual Firestore queries
      console.log('Loading trainings...');
      
      // Mock data for demonstration
      const mockTrainings: TrainingProgram[] = [
        {
          id: '1',
          title: 'Professional House Cleaning',
          description: 'Comprehensive training on modern house cleaning techniques',
          duration: 40,
          maxParticipants: 20,
          currentParticipants: 15,
          instructor: 'Jane Smith',
          schedule: {
            startDate: new Date('2025-08-15'),
            endDate: new Date('2025-08-30'),
            sessions: []
          },
          requirements: ['Basic literacy', 'Physical fitness'],
          materials: ['Cleaning supplies', 'Training manual'],
          certificate: true,
          cost: 50000,
          status: 'open',
          createdBy: 'admin1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setTrainings(mockTrainings);
    } catch (error) {
      console.error('Error loading trainings:', error);
    }
  };

  const loadTrainingRequests = async () => {
    try {
      // Fetch training requests from Firestore
      console.log('Loading training requests...');
      
      // Mock data
      const mockRequests: TrainingRequest[] = [
        {
          id: '1',
          workerId: 'worker1',
          trainingId: '1',
          requestDate: new Date(),
          status: 'pending',
          paymentStatus: 'pending',
          paymentAmount: 50000
        }
      ];
      
      setTrainingRequests(mockRequests);
    } catch (error) {
      console.error('Error loading training requests:', error);
    }
  };

  const handleCreateTraining = async () => {
    try {
      const newTraining: TrainingProgram = {
        id: `training_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        currentParticipants: 0,
        instructor: formData.instructor,
        schedule: {
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          sessions: formData.sessions.map(session => ({
            ...session,
            id: `session_${Date.now()}_${Math.random()}`,
            attendance: []
          }))
        },
        requirements: formData.requirements.split(',').map(r => r.trim()),
        materials: formData.materials.split(',').map(m => m.trim()),
        certificate: true,
        cost: formData.cost,
        status: 'draft',
        createdBy: 'current_admin_id', // Would get from auth context
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      console.log('Creating training:', newTraining);
      
      setTrainings([...trainings, newTraining]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating training:', error);
    }
  };

  const handleUpdateTraining = async () => {
    if (!selectedTraining) return;

    try {
      const updatedTraining: TrainingProgram = {
        ...selectedTraining,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        instructor: formData.instructor,
        cost: formData.cost,
        requirements: formData.requirements.split(',').map(r => r.trim()),
        materials: formData.materials.split(',').map(m => m.trim()),
        schedule: {
          ...selectedTraining.schedule,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        },
        updatedAt: new Date()
      };

      // Update in Firestore
      console.log('Updating training:', updatedTraining);
      
      setTrainings(trainings.map(t => t.id === selectedTraining.id ? updatedTraining : t));
      setIsEditMode(false);
      setSelectedTraining(null);
      resetForm();
    } catch (error) {
      console.error('Error updating training:', error);
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (!confirm('Are you sure you want to delete this training program?')) return;

    try {
      // Delete from Firestore
      console.log('Deleting training:', trainingId);
      
      setTrainings(trainings.filter(t => t.id !== trainingId));
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const updatedRequest = trainingRequests.find(r => r.id === requestId);
      if (!updatedRequest) return;

      updatedRequest.status = 'approved';
      updatedRequest.approvedBy = 'current_admin_id';
      updatedRequest.approvedAt = new Date();

      // Update in Firestore
      console.log('Approving training request:', updatedRequest);
      
      setTrainingRequests([...trainingRequests]);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const updatedRequest = trainingRequests.find(r => r.id === requestId);
      if (!updatedRequest) return;

      updatedRequest.status = 'rejected';

      // Update in Firestore
      console.log('Rejecting training request:', updatedRequest);
      
      setTrainingRequests([...trainingRequests]);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 0,
      maxParticipants: 0,
      instructor: '',
      cost: 0,
      requirements: '',
      materials: '',
      startDate: '',
      endDate: '',
      sessions: []
    });
  };

  const openEditDialog = (training: TrainingProgram) => {
    setSelectedTraining(training);
    setFormData({
      title: training.title,
      description: training.description,
      duration: training.duration,
      maxParticipants: training.maxParticipants,
      instructor: training.instructor,
      cost: training.cost,
      requirements: training.requirements.join(', '),
      materials: training.materials.join(', '),
      startDate: training.schedule.startDate.toISOString().split('T')[0],
      endDate: training.schedule.endDate.toISOString().split('T')[0],
      sessions: training.schedule.sessions.map(s => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        topic: s.topic,
        location: s.location
      }))
    });
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const getStatusBadge = (status: TrainingProgram['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500', text: 'Draft' },
      open: { color: 'bg-green-500', text: 'Open' },
      in_progress: { color: 'bg-blue-500', text: 'In Progress' },
      completed: { color: 'bg-purple-500', text: 'Completed' },
      cancelled: { color: 'bg-red-500', text: 'Cancelled' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Training Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsEditMode(false); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Edit Training Program' : 'Create New Training Program'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cost">Cost (RWF)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                <Input
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Basic literacy, Physical fitness"
                />
              </div>
              
              <div>
                <Label htmlFor="materials">Materials (comma-separated)</Label>
                <Input
                  id="materials"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  placeholder="Training manual, Equipment"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={isEditMode ? handleUpdateTraining : handleCreateTraining}>
                  {isEditMode ? 'Update' : 'Create'} Training
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Training Programs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Training Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.title}</TableCell>
                    <TableCell>{training.instructor}</TableCell>
                    <TableCell>{training.duration}h</TableCell>
                    <TableCell>
                      {training.currentParticipants}/{training.maxParticipants}
                    </TableCell>
                    <TableCell>{training.cost.toLocaleString()} RWF</TableCell>
                    <TableCell>{getStatusBadge(training.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(training)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTraining(training.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Training Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Training Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker ID</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingRequests.map((request) => {
                  const training = trainings.find(t => t.id === request.trainingId);
                  return (
                    <TableRow key={request.id}>
                      <TableCell>{request.workerId}</TableCell>
                      <TableCell>{training?.title || 'Unknown'}</TableCell>
                      <TableCell>{request.requestDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={request.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {request.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
