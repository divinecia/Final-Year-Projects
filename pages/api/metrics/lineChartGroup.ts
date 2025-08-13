// API route for Line Chart Group metrics
import { NextApiRequest, NextApiResponse } from 'next'
import { getFirestore } from 'firebase-admin/firestore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getFirestore()
  // Replace with actual Firestore queries for each metric
  const bookingActivity = await db.collection('bookings').get()
  const maintenanceReports = await db.collection('maintenanceReports').get()
  const messagingActivity = await db.collection('messages').get()
  const revenueForecast = await db.collection('revenue').get()
  const userGrowth = await db.collection('users').get()

  res.status(200).json({
    bookingActivity: bookingActivity.docs.map(doc => doc.data()),
    maintenanceReports: maintenanceReports.docs.map(doc => doc.data()),
    messagingActivity: messagingActivity.docs.map(doc => doc.data()),
    revenueForecast: revenueForecast.docs.map(doc => doc.data()),
    userGrowth: userGrowth.docs.map(doc => doc.data()),
  })
}
