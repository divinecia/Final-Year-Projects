// API route for Donut Chart Group metrics
import { NextApiRequest, NextApiResponse } from 'next'
import { getFirestore } from 'firebase-admin/firestore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getFirestore()
  // Replace with actual Firestore queries for each metric
  const userRoles = await db.collection('users').get()
  const trainingStatus = await db.collection('trainingModules').get()
  const reviewRatings = await db.collection('reviews').get()

  res.status(200).json({
    userRoles: userRoles.docs.map(doc => doc.data()),
    trainingStatus: trainingStatus.docs.map(doc => doc.data()),
    reviewRatings: reviewRatings.docs.map(doc => doc.data()),
  })
}
