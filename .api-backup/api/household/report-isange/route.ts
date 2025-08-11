import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();
    
    // In a real implementation, you would integrate with SendGrid or another email service
    // For now, we'll simulate the email sending
    
    const emailData = {
      to: [
        'info1@kicukiro.gov.rw', // ISANGE One Stop Center
        'support@househelp.app'  // Company copy
      ],
      from: 'noreply@househelp.app',
      subject: `Worker Safety Report - ${reportData.notificationTitle}`,
      html: `
        <h2>Worker Safety Report from Househelp Platform</h2>
        <p><strong>Report Type:</strong> ${reportData.type}</p>
        <p><strong>Title:</strong> ${reportData.notificationTitle}</p>
        <p><strong>Description:</strong> ${reportData.notificationDescription}</p>
        <p><strong>Detailed Message:</strong> ${reportData.message}</p>
        <p><strong>User ID:</strong> ${reportData.userId}</p>
        <p><strong>Reported At:</strong> ${new Date(reportData.createdAt).toLocaleString()}</p>
        
        <hr>
        <h3>ISANGE ONE STOP CENTER Contact Information:</h3>
        <p><strong>Hotline:</strong> 4575</p>
        <p><strong>Website:</strong> https://www.kicukiro.gov.rw/twandikire</p>
        <p><strong>Email:</strong> info1@kicukiro.gov.rw</p>
        
        <p><em>This report has been automatically forwarded from the Househelp platform for your review and appropriate action.</em></p>
      `
    };

    // Log the email data (in production, actually send the email)
    console.log('ISANGE Report Email:', emailData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Report sent to ISANGE One Stop Center and company support.' 
    });
    
  } catch (error) {
    console.error('Error sending ISANGE report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send report' },
      { status: 500 }
    );
  }
}