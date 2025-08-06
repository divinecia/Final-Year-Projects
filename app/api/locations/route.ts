import { NextRequest, NextResponse } from 'next/server';
import { getLocations, getDistrictsByProvince, getProvinces, getSectorsByDistrict } from '@/lib/services-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');
    const district = searchParams.get('district');
    const action = searchParams.get('action');

    // Get provinces
    if (action === 'provinces') {
      const provinces = await getProvinces();
      return NextResponse.json({ provinces });
    }

    // Get sectors by district
    if (district) {
      const sectors = await getSectorsByDistrict(district);
      return NextResponse.json({ sectors });
    }

    // Get districts by province
    if (province) {
      const districts = await getDistrictsByProvince(province);
      return NextResponse.json({ districts });
    }

    // Get all locations
    const locationsData = await getLocations();
    return NextResponse.json(locationsData);

  } catch (error) {
    console.error('Error in locations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
