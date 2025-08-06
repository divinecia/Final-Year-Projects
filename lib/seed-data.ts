import { Timestamp } from 'firebase/firestore';

// Type definitions
type Gender = 'male' | 'female';
type Status = 'active' | 'pending';
type AvailabilityType = 'full-time' | 'part-time';
type Preference = 'one-time' | 'recurring';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface Availability {
  days: string[];
  hours: string;
  type: AvailabilityType;
  preferences: Preference[];
}

interface Worker {
  fullName: string;
  phone: string;
  email: string;
  dob: Timestamp;
  gender: Gender;
  nationalId: string;
  district: string;
  sector: string;
  address: string;
  emergencyContact: EmergencyContact;
  experienceYears: number;
  bio: string;
  skills: string[];
  languages: string[];
  availability: Availability;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  status: Status;
  profilePictureUrl: string;
  dateJoined: Timestamp;
}

export const workers: Worker[] = [
  {
    fullName: 'Aline Uwamahoro',
    phone: '0781234567',
    email: 'aline.uwamahoro@example.com',
    dob: Timestamp.fromDate(new Date('1995-03-12')),
    gender: 'female',
    nationalId: '1199580012345678',
    district: 'Gasabo',
    sector: 'Kimihurura',
    address: 'KG 680 St',
    emergencyContact: {
      name: 'Jean Paul Mugisha',
      phone: '0788765432',
      relationship: 'Brother',
    },
    experienceYears: 5,
    bio: 'Experienced and reliable worker with a passion for creating clean and organized homes. Skilled in deep cleaning, laundry, and basic gardening. I am a loyal and discreet professional who respects the privacy of every family I work with.',
    skills: ['general_cleaning', 'deep_cleaning', 'laundry', 'gardening'],
    languages: ['kinyarwanda', 'english'],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hours: '8am - 5pm',
      type: 'full-time',
      preferences: ['one-time', 'recurring'],
    },
    rating: 4.8,
    reviewsCount: 15,
    hourlyRate: 1500,
    status: 'active',
    profilePictureUrl: 'https://placehold.co/200x200.png',
    dateJoined: Timestamp.fromDate(new Date('2023-01-15')),
  },
  {
    fullName: 'Emmanuel Nsengimana',
    phone: '0782345678',
    email: 'emmanuel.nsengimana@example.com',
    dob: Timestamp.fromDate(new Date('1992-07-21')),
    gender: 'male',
    nationalId: '1199270098765432',
    district: 'Kicukiro',
    sector: 'Kagarama',
    address: 'KK 31 Ave',
    emergencyContact: {
      name: 'Chantal Dusabe',
      phone: '0722345678',
      relationship: 'Wife',
    },
    experienceYears: 8,
    bio: 'Professional handyman and gardener with over 8 years of experience. I take pride in my work and always ensure the highest quality results. Available for both small repairs and large gardening projects.',
    skills: ['gardening', 'handyman', 'general_cleaning'],
    languages: ['kinyarwanda', 'french'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      hours: '9am - 6pm',
      type: 'part-time',
      preferences: ['one-time'],
    },
    rating: 4.9,
    reviewsCount: 25,
    hourlyRate: 2000,
    status: 'active',
    profilePictureUrl: 'https://placehold.co/200x200.png',
    dateJoined: Timestamp.fromDate(new Date('2022-11-20')),
  },
  {
    fullName: 'Beatrice Mukamana',
    phone: '0733456789',
    email: 'beatrice.mukamana@example.com',
    dob: Timestamp.fromDate(new Date('1988-11-05')),
    gender: 'female',
    nationalId: '1198880054321987',
    district: 'Nyarugenge',
    sector: 'Nyamirambo',
    address: 'KN 2 Ave',
    emergencyContact: {
      name: 'David Cyusa',
      phone: '0739876543',
      relationship: 'Husband',
    },
    experienceYears: 10,
    bio: 'Caring and experienced nanny with a specialization in early childhood development. I have a genuine love for children and create a safe, nurturing, and stimulating environment for them. Certified in first aid.',
    skills: ['child_care', 'cooking', 'laundry'],
    languages: ['kinyarwanda', 'english', 'swahili'],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      hours: '7am - 4pm',
      type: 'full-time',
      preferences: ['recurring'],
    },
    rating: 5.0,
    reviewsCount: 32,
    hourlyRate: 2500,
    status: 'active',
    profilePictureUrl: 'https://placehold.co/200x200.png',
    dateJoined: Timestamp.fromDate(new Date('2021-05-10')),
  },
  {
    fullName: 'Olivier Kwizera',
    phone: '0729876543',
    email: '',
    dob: Timestamp.fromDate(new Date('2000-01-30')),
    gender: 'male',
    nationalId: '1200070011223344',
    district: 'Gasabo',
    sector: 'Remera',
    address: 'KG 17 Ave',
    emergencyContact: {
      name: 'Grace Uwase',
      phone: '0788112233',
      relationship: 'Mother',
    },
    experienceYears: 2,
    bio: 'Young, energetic, and eager to learn. I am a hard worker and quick to follow instructions. My main skills are in general cleaning and running errands, and I am looking for opportunities to grow.',
    skills: ['general_cleaning', 'errands'],
    languages: ['kinyarwanda'],
    availability: {
      days: ['Saturday', 'Sunday'],
      hours: 'flexible',
      type: 'part-time',
      preferences: ['one-time'],
    },
    rating: 4.5,
    reviewsCount: 4,
    hourlyRate: 1000,
    status: 'pending',
    profilePictureUrl: 'https://placehold.co/200x200.png',
    dateJoined: Timestamp.fromDate(new Date('2024-03-01')),
  },
  {
    fullName: 'Solange Umutoni',
    phone: '0785556677',
    email: 'solange.umutoni@example.com',
    dob: Timestamp.fromDate(new Date('1990-09-18')),
    gender: 'female',
    nationalId: '1199080077665544',
    district: 'Kicukiro',
    sector: 'Gikondo',
    address: 'KK 705 St',
    emergencyContact: {
      name: 'Eric Manzi',
      phone: '0725556677',
      relationship: 'Friend',
    },
    experienceYears: 7,
    bio: 'Dedicated and compassionate caregiver specializing in elderly care. I provide assistance with daily activities, medication reminders, and companionship. My goal is to ensure the comfort and well-being of your loved ones.',
    skills: ['elderly_care', 'personal_wellness_support', 'cooking'],
    languages: ['kinyarwanda', 'french'],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hours: 'Live-in optional',
      type: 'full-time',
      preferences: ['recurring'],
    },
    rating: 4.9,
    reviewsCount: 18,
    hourlyRate: 1800,
    status: 'active',
    profilePictureUrl: 'https://placehold.co/200x200.png',
    dateJoined: Timestamp.fromDate(new Date('2022-08-22')),
  },
  {
    fullName: 'Kevin Mugabo',
    phone: '0738889900',
    email: 'kevin.mugabo@example.com',
    dob: Timestamp.fromDate(new Date('1998-04-25')),
    gender: 'male',
    nationalId: '1199870099887766',
    district: 'Gasabo',
    sector: 'Kacyiru',
    address: 'KG 5 Ave',
    emergencyContact: {
      name: 'Sarah Umwiza',
      phone: '0789998877',
      relationship: 'Cousin',
    },
    experienceYears: 3,
    bio: 'I am a pet lover and experienced pet sitter. I can handle dogs and cats of all sizes and breeds. Services include walking, feeding, playing, and overnight stays. Your pet will be in safe and loving hands.',
    skills: ['pet_care', 'errands'],
    languages: ['english', 'kinyarwanda'],
    availability: {
      days: ['Friday', 'Saturday', 'Sunday'],
      hours: 'flexible',
      type: 'part-time',
      preferences: ['one-time', 'recurring'],
    },
    rating: 4.7,
    reviewsCount: 9,
    hourlyRate: 1200,
    status: 'pending',
    profilePictureUrl: 'https://placehold.co/200x200.png',
    dateJoined: Timestamp.fromDate(new Date('2024-02-11')),
  },
];
