import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

// Set your SendGrid API key here or use environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notificationTitle, notificationDescription, message, userId, createdAt } = req.body;

  try {
    await sgMail.send({
      to: 'info1@kicukiro.gov.rw', // Official Kicukiro contact for ISANGE
      from: req.body.userEmail || 'noreply@yourdomain.com', // Use user's email if provided
      subject: `Worker Violence/Criminal Report from User ${userId}`,
      text:
        `Title: ${notificationTitle}\nDescription: ${notificationDescription}\nMessage: ${message}\nReported At: ${createdAt}\n\n` +
        `ISANGE ONE STOP CENTER Contacts:\nHotline: 4575\nWebsite: https://www.kicukiro.gov.rw/twandikire\n\n` +
        `Report Status: Received\nWe will review your report and update you on the progress.\n` +
        `After resolution, you will be invited to provide feedback on your experience.\n`,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
