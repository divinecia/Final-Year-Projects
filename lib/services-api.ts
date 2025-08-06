import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  category: string;
}

export type ServiceCategory = Record<string, Service>;

export interface ServicesDocument {
  categories: ServiceCategory;
  lastUpdated: string;
}

// Location Types
export interface Sector {
  name: string;
  code: string;
}

export interface District {
  name: string;
  province: string;
  code: string;
  sectors: Record<string, Sector>;
}

export interface LocationsDocument {
  districts: Record<string, District>;
  lastUpdated: string;
}

// Cache for better performance
let servicesCache: ServicesDocument | null = null;
let locationsCache: LocationsDocument | null = null;
let servicesCacheTime = 0;
let locationsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all services from Firestore, with cache and fallback.
 */
export async function getServices(): Promise<ServicesDocument> {
  const now = Date.now();
  if (servicesCache && (now - servicesCacheTime) < CACHE_DURATION) {
    return servicesCache;
  }
  try {
    const servicesDoc = await getDoc(doc(db, 'services', 'services'));
    if (servicesDoc.exists()) {
      const data = servicesDoc.data() as ServicesDocument;
      servicesCache = data;
      servicesCacheTime = now;
      return data;
    }
    throw new Error('Services document not found');
  } catch (error) {
    console.error('Error fetching services:', error);
    return getFallbackServices();
  }
}

/**
 * Get services by category.
 */
export async function getServicesByCategory(category: string): Promise<Service[]> {
  const servicesData = await getServices();
  return Object.values(servicesData.categories).filter(
    service => service.category === category
  );
}

/**
 * Get a specific service by ID.
 */
export async function getServiceById(serviceId: string): Promise<Service | null> {
  const servicesData = await getServices();
  return servicesData.categories[serviceId] || null;
}

/**
 * Get all unique service categories.
 */
export async function getServiceCategories(): Promise<string[]> {
  const servicesData = await getServices();
  return Array.from(new Set(Object.values(servicesData.categories).map(s => s.category)));
}

/**
 * Get all locations from Firestore, with cache and fallback.
 */
export async function getLocations(): Promise<LocationsDocument> {
  const now = Date.now();
  if (locationsCache && (now - locationsCacheTime) < CACHE_DURATION) {
    return locationsCache;
  }
  try {
    const locationsDoc = await getDoc(doc(db, 'locations', 'locations'));
    if (locationsDoc.exists()) {
      const data = locationsDoc.data() as LocationsDocument;
      locationsCache = data;
      locationsCacheTime = now;
      return data;
    }
    throw new Error('Locations document not found');
  } catch (error) {
    console.error('Error fetching locations:', error);
    return getFallbackLocations();
  }
}

/**
 * Get districts by province.
 */
export async function getDistrictsByProvince(province: string): Promise<District[]> {
  const locationsData = await getLocations();
  return Object.values(locationsData.districts).filter(
    district => district.province === province
  );
}

/**
 * Get all unique provinces.
 */
export async function getProvinces(): Promise<string[]> {
  const locationsData = await getLocations();
  return Array.from(new Set(Object.values(locationsData.districts).map(d => d.province)));
}

/**
 * Get sectors for a specific district.
 */
export async function getSectorsByDistrict(districtId: string): Promise<Sector[]> {
  const locationsData = await getLocations();
  const district = locationsData.districts[districtId];
  return district ? Object.values(district.sectors) : [];
}

/**
 * Search services by name or description.
 */
export async function searchServices(query: string): Promise<Service[]> {
  const servicesData = await getServices();
  const searchTerm = query.toLowerCase();
  return Object.values(servicesData.categories).filter(service =>
    service.name.toLowerCase().includes(searchTerm) ||
    service.description.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get service options for forms (id, label, price).
 */
export async function getServiceOptions(): Promise<Array<{ id: string; label: string; price: number }>> {
  const servicesData = await getServices();
  return Object.values(servicesData.categories).map(service => ({
    id: service.id,
    label: service.name,
    price: service.basePrice
  }));
}

/**
 * Get location options for forms.
 */
export async function getLocationOptions(): Promise<Array<{
  district: string;
  province: string;
  sectors: Array<{ id: string; label: string }>;
}>> {
  const locationsData = await getLocations();
  return Object.entries(locationsData.districts).map(([districtId, district]) => ({
    district: districtId,
    province: district.province,
    sectors: Object.entries(district.sectors).map(([sectorId, sector]) => ({
      id: sectorId,
      label: sector.name
    }))
  }));
}

// Fallback data (offline/error fallback)
const fallbackServices: ServicesDocument = {
  categories: {
    house_cleaning: {
      id: "house_cleaning",
      name: "House Cleaning",
      description: "General house cleaning and maintenance",
      icon: "🧹",
      basePrice: 3000,
      category: "cleaning"
    },
    deep_cleaning: {
      id: "deep_cleaning",
      name: "Deep Cleaning",
      description: "Thorough deep cleaning service",
      icon: "🧽",
      basePrice: 4000,
      category: "cleaning"
    },
    cooking: {
      id: "cooking",
      name: "Cooking Services",
      description: "Meal preparation and cooking",
      icon: "👨‍🍳",
      basePrice: 4000,
      category: "culinary"
    },
    childcare: {
      id: "childcare",
      name: "Childcare",
      description: "Professional childcare services",
      icon: "👶",
      basePrice: 2500,
      category: "care"
    },
    gardening: {
      id: "gardening",
      name: "Gardening",
      description: "Garden maintenance and landscaping",
      icon: "🌱",
      basePrice: 3000,
      category: "outdoor"
    }
  },
  lastUpdated: new Date().toISOString()
};

const fallbackLocations: LocationsDocument = {
  districts: {
    gasabo: {
      name: "Gasabo",
      province: "Kigali City",
      code: "11",
      sectors: {
        kacyiru: { name: "Kacyiru", code: "1107" },
        kimihurura: { name: "Kimihurura", code: "1108" },
        remera: { name: "Remera", code: "1113" }
      }
    },
    kicukiro: {
      name: "Kicukiro",
      province: "Kigali City",
      code: "12",
      sectors: {
        gatenga: { name: "Gatenga", code: "1202" },
        kagarama: { name: "Kagarama", code: "1204" }
      }
    }
  },
  lastUpdated: new Date().toISOString()
};

function getFallbackServices(): ServicesDocument {
  return { ...fallbackServices, lastUpdated: new Date().toISOString() };
}

function getFallbackLocations(): LocationsDocument {
  return { ...fallbackLocations, lastUpdated: new Date().toISOString() };
}

/**
 * Clear cache (useful for testing or forced refresh).
 */
export function clearServiceCache(): void {
  servicesCache = null;
  locationsCache = null;
  servicesCacheTime = 0;
  locationsCacheTime = 0;
}
