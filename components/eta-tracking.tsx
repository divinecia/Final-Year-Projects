'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ETATracking, ETANotification } from '@/lib/types/enhanced-system';

interface ETATrackingComponentProps {
  jobId: string;
  workerId: string;
  householdId: string;
  onUpdateETA?: (eta: ETATracking) => void;
}

export function ETATrackingComponent({ 
  jobId, 
  workerId, 
  householdId, 
  onUpdateETA 
}: ETATrackingComponentProps) {
  const [etaData, setEtaData] = useState<ETATracking | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);

  const loadETAData = useCallback(async () => {
    try {
      // Fetch ETA data from Firestore
      // This would be implemented with actual Firestore queries
      console.log('Loading ETA data for job:', jobId);
    } catch (error) {
      console.error('Error loading ETA data:', error);
    }
  }, [jobId]);

  const calculateNewETA = useCallback(async () => {
    try {
      // Use Google Maps API or similar to calculate travel time
      // This is a simplified version
      const estimatedMinutes = Math.random() * 30 + 10; // Mock calculation
      const newETA = new Date(Date.now() + estimatedMinutes * 60000);
      
      setEstimatedTime(newETA.toLocaleTimeString());
      
      // Send notification to household about updated ETA
      sendETANotification('eta_update', `Worker will arrive at approximately ${newETA.toLocaleTimeString()}`);
      
    } catch (error) {
      console.error('Error calculating ETA:', error);
    }
  }, []);

  const updateWorkerLocation = useCallback(async (latitude: number, longitude: number) => {
    try {
      const locationUpdate = {
        latitude,
        longitude,
        timestamp: new Date()
      };

      // Update location in Firestore
      // This would be implemented with actual Firestore updates
      console.log('Updating worker location:', locationUpdate);

      // Calculate new ETA based on current location
      calculateNewETA();
    } catch (error) {
      console.error('Error updating worker location:', error);
    }
  }, [calculateNewETA]);

  const startLocationTracking = useCallback(() => {
    setIsTracking(true);
    
    // Request location permission and start tracking
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateWorkerLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000
        }
      );

      // Store watchId for cleanup
      (window as unknown as { etaWatchId: number }).etaWatchId = watchId;
    }
  }, [updateWorkerLocation]);

  const stopLocationTracking = useCallback(() => {
    setIsTracking(false);
    if ((window as unknown as { etaWatchId?: number }).etaWatchId) {
      navigator.geolocation.clearWatch((window as unknown as { etaWatchId: number }).etaWatchId);
    }
  }, []);

  useEffect(() => {
    // Load existing ETA data
    loadETAData();
    
    // Set up real-time tracking if worker is en route
    if (etaData?.status === 'en_route') {
      startLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [jobId, etaData?.status, loadETAData, startLocationTracking, stopLocationTracking]);

  const sendETANotification = async (type: ETANotification['type'], message: string) => {
    try {
      const notification: ETANotification = {
        id: `eta_${Date.now()}`,
        type,
        message,
        timestamp: new Date(),
        sent: false
      };

      // Send notification via Firebase Cloud Messaging
      console.log('Sending ETA notification:', notification);
      
      // Update notification status
      notification.sent = true;
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const confirmArrival = async () => {
    try {
      const arrivalTime = new Date();
      
      const updatedETA: ETATracking = {
        ...etaData!,
        actualArrivalTime: arrivalTime,
        status: 'arrived',
        updatedAt: arrivalTime
      };

      setEtaData(updatedETA);
      stopLocationTracking();
      
      // Send arrival confirmation notification
      sendETANotification('arrival_confirmed', 'Worker has arrived at your location');
      
      // Update in Firestore
      if (onUpdateETA) {
        onUpdateETA(updatedETA);
      }
      
    } catch (error) {
      console.error('Error confirming arrival:', error);
    }
  };

  const updateEstimatedArrival = async () => {
    if (!estimatedTime) return;

    try {
      const [hours, minutes] = estimatedTime.split(':').map(Number);
      const eta = new Date();
      eta.setHours(hours, minutes, 0, 0);

      const updatedETA: ETATracking = {
        id: etaData?.id || `eta_${Date.now()}`,
        workerId,
        householdId,
        jobId,
        estimatedArrivalTime: eta,
        status: 'en_route',
        notifications: etaData?.notifications || [],
        createdAt: etaData?.createdAt || new Date(),
        updatedAt: new Date()
      };

      setEtaData(updatedETA);
      
      // Start tracking if not already tracking
      if (!isTracking) {
        startLocationTracking();
      }
      
      // Send initial ETA notification
      sendETANotification('eta_update', `Worker is on the way and will arrive at ${eta.toLocaleTimeString()}`);
      
      if (onUpdateETA) {
        onUpdateETA(updatedETA);
      }
      
    } catch (error) {
      console.error('Error updating ETA:', error);
    }
  };

  const getStatusBadge = (status: ETATracking['status']) => {
    const statusConfig = {
      en_route: { color: 'bg-blue-500', text: 'On the way', icon: MapPin },
      arrived: { color: 'bg-green-500', text: 'Arrived', icon: CheckCircle },
      delayed: { color: 'bg-yellow-500', text: 'Delayed', icon: Clock },
      cancelled: { color: 'bg-red-500', text: 'Cancelled', icon: AlertCircle }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Worker Arrival Tracking</span>
          {etaData && getStatusBadge(etaData.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!etaData || etaData.status === 'cancelled' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="eta-time">Set Estimated Arrival Time</Label>
              <Input
                id="eta-time"
                type="time"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={updateEstimatedArrival} 
              className="w-full"
              disabled={!estimatedTime}
            >
              Start Tracking
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Arrival:</span>
              <span className="font-medium">
                {etaData.estimatedArrivalTime.toLocaleTimeString()}
              </span>
            </div>
            
            {etaData.actualArrivalTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Actual Arrival:</span>
                <span className="font-medium text-green-600">
                  {etaData.actualArrivalTime.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {etaData.currentLocation && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  Location updated {etaData.currentLocation.timestamp.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {isTracking && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Live tracking active</span>
              </div>
            )}
            
            {etaData.status === 'en_route' && (
              <Button 
                onClick={confirmArrival} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Arrival
              </Button>
            )}
            
            {etaData.status === 'arrived' && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Worker has arrived!</p>
              </div>
            )}
          </div>
        )}
        
        {etaData?.notifications && etaData.notifications.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {etaData.notifications.slice(-3).map((notification) => (
                <div key={notification.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <span>{notification.message}</span>
                    <span className="text-gray-500 ml-2">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
