import { NextRequest, NextResponse } from 'next/server';
import { getServices, getServicesByCategory, getServiceById, getServiceCategories } from '@/lib/services-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const serviceId = searchParams.get('id');
    const action = searchParams.get('action');

    // Get specific service by ID
    if (serviceId) {
      const service = await getServiceById(serviceId);
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ service });
    }

    // Get service categories
    if (action === 'categories') {
      const categories = await getServiceCategories();
      return NextResponse.json({ categories });
    }

    // Get services by category
    if (category) {
      const services = await getServicesByCategory(category);
      return NextResponse.json({ services });
    }

    // Get all services
    const servicesData = await getServices();
    return NextResponse.json(servicesData);

  } catch (error) {
    console.error('Error in services API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
