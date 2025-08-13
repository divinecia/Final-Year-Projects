// API route for Bar Chart Group metrics
import { NextApiRequest, NextApiResponse } from 'next'
import { adminDb } from '@/lib/firebase-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Notification Volume by Channel (in-app vs email)
  const notificationsSnap = await adminDb.collection('notifications').get()
  const notificationVolume = notificationsSnap.docs.reduce((acc, doc) => {
    const channel = doc.data().channel || 'in-app'
    acc[channel] = (acc[channel] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Safety Reports by Type (incidentType)
  const safetyReportsSnap = await adminDb.collection('reports').get()
  const safetyReports = safetyReportsSnap.docs.reduce((acc, doc) => {
    const type = doc.data().incidentType || 'other'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Emergency Service Requests (group by urgency/time/location)
  const emergencyRequestsSnap = await adminDb.collection('emergencyRequests').get()
  const emergencyRequests = emergencyRequestsSnap.docs.map(doc => doc.data())

  // Review Ratings Distribution (histogram)
  const reviewsSnap = await adminDb.collection('reviews').get()
  const reviewRatings = reviewsSnap.docs.reduce((acc, doc) => {
    const rating = doc.data().rating || 0
    acc[rating] = (acc[rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  res.status(200).json({
    notificationVolume,
    safetyReports,
    emergencyRequests,
    reviewRatings,
  })
}
