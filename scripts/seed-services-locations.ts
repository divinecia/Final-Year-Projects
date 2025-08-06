/**
 * Script to seed Firestore with services and locations data.
 * Run this once to populate your Firestore database.
 */

import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// --- Type Definitions ---
type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  category: string;
};

type ServicesData = {
  categories: Record<string, ServiceCategory>;
  lastUpdated: string;
};

type Sector = { name: string; code: string };
type District = {
  name: string;
  province: string;
  code: string;
  sectors: Record<string, Sector>;
};
type LocationsData = {
  districts: Record<string, District>;
  lastUpdated: string;
};

type SystemConfigData = {
  payFrequencies: Record<string, any>;
  jobStatuses: Record<string, any>;
  userRoles: Record<string, any>;
  paymentStatuses: Record<string, any>;
  lastUpdated: string;
};

// --- Data ---
const now = new Date().toISOString();

const servicesData: ServicesData = {
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
    },
    laundry_ironing: {
      id: "laundry_ironing",
      name: "Laundry & Ironing",
      description: "Washing, drying, and ironing clothes",
      icon: "👕",
      basePrice: 2000,
      category: "textile"
    },
    elderly_care: {
      id: "elderly_care",
      name: "Elderly Care",
      description: "Compassionate care for elderly family members",
      icon: "👴",
      basePrice: 3500,
      category: "care"
    },
    pet_care: {
      id: "pet_care",
      name: "Pet Care",
      description: "Pet sitting, walking, and care services",
      icon: "🐕",
      basePrice: 2500,
      category: "specialized"
    },
    handyman: {
      id: "handyman",
      name: "Handyman Services",
      description: "Basic repairs and maintenance",
      icon: "🔧",
      basePrice: 3500,
      category: "specialized"
    },
    driver_services: {
      id: "driver_services",
      name: "Personal Driver",
      description: "Personal transportation services",
      icon: "🚗",
      basePrice: 4000,
      category: "specialized"
    }
  },
  lastUpdated: now
};

const locationsData: LocationsData = {
  districts: {
    gasabo: {
      name: "Gasabo",
      province: "Kigali City",
      code: "11",
      sectors: {
        bumbogo: { name: "Bumbogo", code: "1101" },
        gatsata: { name: "Gatsata", code: "1102" },
        gikomero: { name: "Gikomero", code: "1103" },
        gisozi: { name: "Gisozi", code: "1104" },
        jabana: { name: "Jabana", code: "1105" },
        jali: { name: "Jali", code: "1106" },
        kacyiru: { name: "Kacyiru", code: "1107" },
        kimihurura: { name: "Kimihurura", code: "1108" },
        kimironko: { name: "Kimironko", code: "1109" },
        kinyinya: { name: "Kinyinya", code: "1110" },
        ndera: { name: "Ndera", code: "1111" },
        nduba: { name: "Nduba", code: "1112" },
        remera: { name: "Remera", code: "1113" },
        rusororo: { name: "Rusororo", code: "1114" },
        rutunga: { name: "Rutunga", code: "1115" }
      }
    },
    kicukiro: {
      name: "Kicukiro",
      province: "Kigali City",
      code: "12",
      sectors: {
        gahanga: { name: "Gahanga", code: "1201" },
        gatenga: { name: "Gatenga", code: "1202" },
        gikondo: { name: "Gikondo", code: "1203" },
        kagarama: { name: "Kagarama", code: "1204" },
        kanombe: { name: "Kanombe", code: "1205" },
        kicukiro: { name: "Kicukiro", code: "1206" },
        masaka: { name: "Masaka", code: "1207" },
        niboye: { name: "Niboye", code: "1208" },
        nyarugunga: { name: "Nyarugunga", code: "1209" },
        rwebitaba: { name: "Rwebitaba", code: "1210" }
      }
    },
    nyarugenge: {
      name: "Nyarugenge",
      province: "Kigali City",
      code: "13",
      sectors: {
        gitega: { name: "Gitega", code: "1301" },
        kimisagara: { name: "Kimisagara", code: "1302" },
        kugirema: { name: "Kugirema", code: "1303" },
        mageragere: { name: "Mageragere", code: "1304" },
        muhima: { name: "Muhima", code: "1305" },
        nyakabanda: { name: "Nyakabanda", code: "1306" },
        nyamirambo: { name: "Nyamirambo", code: "1307" },
        nyarugenge: { name: "Nyarugenge", code: "1308" },
        rwezamenyo: { name: "Rwezamenyo", code: "1309" }
      }
    },
    muhanga: {
      name: "Muhanga",
      province: "Southern Province",
      code: "22",
      sectors: {
        cyeza: { name: "Cyeza", code: "2201" },
        kabacuzi: { name: "Kabacuzi", code: "2202" },
        kibangu: { name: "Kibangu", code: "2203" },
        kiyumba: { name: "Kiyumba", code: "2204" },
        muhanga: { name: "Muhanga", code: "2205" },
        mukura: { name: "Mukura", code: "2206" },
        mushishiro: { name: "Mushishiro", code: "2207" },
        nyabindu: { name: "Nyabindu", code: "2208" },
        nyamabuye: { name: "Nyamabuye", code: "2209" },
        nyarubaka: { name: "Nyarubaka", code: "2210" },
        rongi: { name: "Rongi", code: "2211" },
        rugendabari: { name: "Rugendabari", code: "2212" }
      }
    },
    karongi: {
      name: "Karongi",
      province: "Western Province",
      code: "31",
      sectors: {
        bwishyura: { name: "Bwishyura", code: "3101" },
        gashari: { name: "Gashari", code: "3102" },
        gitesi: { name: "Gitesi", code: "3103" },
        kivumu: { name: "Kivumu", code: "3104" },
        mutuntu: { name: "Mutuntu", code: "3105" },
        rugabano: { name: "Rugabano", code: "3106" },
        ruganda: { name: "Ruganda", code: "3107" },
        murambi: { name: "Murambi", code: "3108" },
        gishyita: { name: "Gishyita", code: "3109" },
        twumba: { name: "Twumba", code: "3110" }
      }
    },
    musanze: {
      name: "Musanze",
      province: "Northern Province",
      code: "41",
      sectors: {
        busogo: { name: "Busogo", code: "4101" },
        cyuve: { name: "Cyuve", code: "4102" },
        gacaca: { name: "Gacaca", code: "4103" },
        gashaki: { name: "Gashaki", code: "4104" },
        gataraga: { name: "Gataraga", code: "4105" },
        kimonyi: { name: "Kimonyi", code: "4106" },
        kinigi: { name: "Kinigi", code: "4107" },
        muhoza: { name: "Muhoza", code: "4108" },
        muko: { name: "Muko", code: "4109" },
        musanze: { name: "Musanze", code: "4110" },
        nkotsi: { name: "Nkotsi", code: "4111" },
        nyange: { name: "Nyange", code: "4112" },
        remera: { name: "Remera", code: "4113" },
        rwaza: { name: "Rwaza", code: "4114" },
        shingiro: { name: "Shingiro", code: "4115" }
      }
    },
    rwamagana: {
      name: "Rwamagana",
      province: "Eastern Province",
      code: "51",
      sectors: {
        fumbwe: { name: "Fumbwe", code: "5101" },
        gahengeri: { name: "Gahengeri", code: "5102" },
        gishari: { name: "Gishari", code: "5103" },
        karenge: { name: "Karenge", code: "5104" },
        kigabiro: { name: "Kigabiro", code: "5105" },
        muhazi: { name: "Muhazi", code: "5106" },
        munyaga: { name: "Munyaga", code: "5107" },
        munyiginya: { name: "Munyiginya", code: "5108" },
        musha: { name: "Musha", code: "5109" },
        muyumbu: { name: "Muyumbu", code: "5110" },
        nyakaliro: { name: "Nyakaliro", code: "5111" },
        nzige: { name: "Nzige", code: "5112" },
        rubona: { name: "Rubona", code: "5113" },
        rukira: { name: "Rukira", code: "5114" }
      }
    }
  },
  lastUpdated: now
};

const systemConfigData: SystemConfigData = {
  payFrequencies: {
    per_hour: {
      id: "per_hour",
      label: "Per Hour",
      description: "Hourly rate payment",
      multiplier: 1
    },
    per_day: {
      id: "per_day",
      label: "Per Day",
      description: "Daily rate (8 hours)",
      multiplier: 8
    },
    per_week: {
      id: "per_week",
      label: "Per Week",
      description: "Weekly rate (40 hours)",
      multiplier: 40
    },
    per_month: {
      id: "per_month",
      label: "Per Month",
      description: "Monthly salary (160 hours)",
      multiplier: 160
    }
  },
  jobStatuses: {
    open: {
      id: "open",
      label: "Open",
      description: "Job is available for applications",
      color: "blue"
    },
    assigned: {
      id: "assigned",
      label: "Assigned",
      description: "Worker has been assigned to the job",
      color: "yellow"
    },
    in_progress: {
      id: "in_progress",
      label: "In Progress",
      description: "Job is currently being worked on",
      color: "orange"
    },
    completed: {
      id: "completed",
      label: "Completed",
      description: "Job has been completed successfully",
      color: "green"
    },
    cancelled: {
      id: "cancelled",
      label: "Cancelled",
      description: "Job was cancelled",
      color: "red"
    }
  },
  userRoles: {
    worker: {
      id: "worker",
      label: "Worker",
      description: "Service provider",
      permissions: ["apply_jobs", "view_earnings", "update_profile"]
    },
    household: {
      id: "household",
      label: "Household",
      description: "Service requester",
      permissions: ["post_jobs", "hire_workers", "make_payments"]
    },
    admin: {
      id: "admin",
      label: "Administrator",
      description: "Platform administrator",
      permissions: ["manage_users", "manage_jobs", "view_analytics", "manage_payments"]
    }
  },
  paymentStatuses: {
    pending: {
      id: "pending",
      label: "Pending",
      description: "Payment is being processed",
      color: "yellow"
    },
    completed: {
      id: "completed",
      label: "Completed",
      description: "Payment was successful",
      color: "green"
    },
    failed: {
      id: "failed",
      label: "Failed",
      description: "Payment failed",
      color: "red"
    },
    cancelled: {
      id: "cancelled",
      label: "Cancelled",
      description: "Payment was cancelled",
      color: "gray"
    },
    refunded: {
      id: "refunded",
      label: "Refunded",
      description: "Payment was refunded",
      color: "purple"
    }
  },
  lastUpdated: now
};

// --- Seeding Function ---
export async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seeding...');

    await setDoc(doc(db, 'services', 'services'), servicesData);
    console.log('✅ Services data seeded successfully');

    await setDoc(doc(db, 'locations', 'locations'), locationsData);
    console.log('✅ Locations data seeded successfully');

    await setDoc(doc(db, 'system', 'config'), systemConfigData);
    console.log('✅ System configuration data seeded successfully');

    console.log('🎉 Firestore seeding completed!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error instanceof Error ? error.message : error);
    return { success: false, error };
  }
}

// --- Run if executed directly ---
if (typeof require !== 'undefined' && require.main === module) {
  (async () => {
    const result = await seedFirestore();
    if (result.success) {
      console.log('Database seeded successfully');
      process.exit(0);
    } else {
      console.error('Seeding failed:', result.error);
      process.exit(1);
    }
  })();
}