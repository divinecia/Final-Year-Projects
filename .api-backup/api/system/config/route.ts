import { NextRequest, NextResponse } from 'next/server';
import { 
  getPayFrequencyOptions, 
  getJobStatusOptions, 
  getUserRoleOptions, 
  getPaymentStatusOptions 
} from '@/lib/system-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'pay-frequencies': {
        const payFrequencies = await getPayFrequencyOptions();
        return NextResponse.json({ payFrequencies });
      }
      case 'job-statuses': {
        const jobStatuses = await getJobStatusOptions();
        return NextResponse.json({ jobStatuses });
      }
      case 'user-roles': {
        const userRoles = await getUserRoleOptions();
        return NextResponse.json({ userRoles });
      }
      case 'payment-statuses': {
        const paymentStatuses = await getPaymentStatusOptions();
        return NextResponse.json({ paymentStatuses });
      }
      default: {
        // Get all configuration options
        const [payFreqs, jobStats, userRls, payStats] = await Promise.all([
          getPayFrequencyOptions(),
          getJobStatusOptions(),
          getUserRoleOptions(),
          getPaymentStatusOptions()
        ]);
        return NextResponse.json({
          payFrequencies: payFreqs,
          jobStatuses: jobStats,
          userRoles: userRls,
          paymentStatuses: payStats
        });
      }
    }

  } catch (error) {
    console.error('Error in system config API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system configuration' },
      { status: 500 }
    );
  }
}
