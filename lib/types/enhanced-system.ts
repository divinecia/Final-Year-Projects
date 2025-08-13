// Enhanced system types for comprehensive HouseHelp features

export interface ETATracking {
  id: string;
  workerId: string;
  householdId: string;
  jobId: string;
  estimatedArrivalTime: Date;
  actualArrivalTime?: Date;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  status: 'en_route' | 'arrived' | 'delayed' | 'cancelled';
  notifications: ETANotification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ETANotification {
  id: string;
  type: 'eta_update' | 'arrival_confirmed' | 'delay_notice';
  message: string;
  timestamp: Date;
  sent: boolean;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  duration: number; // in hours
  maxParticipants: number;
  currentParticipants: number;
  instructor: string;
  schedule: {
    startDate: Date;
    endDate: Date;
    sessions: TrainingSession[];
  };
  requirements: string[];
  materials: string[];
  certificate: boolean;
  cost: number;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string; // admin ID
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  location: string;
  attendance: WorkerAttendance[];
}

export interface WorkerAttendance {
  workerId: string;
  present: boolean;
  timestamp?: Date;
  notes?: string;
}

export interface TrainingRequest {
  id: string;
  workerId: string;
  trainingId: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  paymentStatus: 'pending' | 'paid' | 'waived';
  paymentAmount: number;
  approvedBy?: string; // admin ID
  approvedAt?: Date;
}

export interface SystemMaintenanceReport {
  id: string;
  title: string;
  description: string;
  category: 'system' | 'database' | 'network' | 'security' | 'performance' | 'ui' | 'api';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed';
  affectedSystems: string[];
  reportedBy: string;
  reportedAt: Date;
  assignedTo?: string;
  estimatedDuration?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  progress?: number;
  userImpact?: string;
  maintenanceSteps?: MaintenanceStep[];
  communicationsSent?: Communication[];
  resolvedAt?: Date;
  resolution?: string;
}

export interface MaintenanceStep {
  stepNumber: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: Date;
}

export interface Communication {
  type: 'users' | 'admin' | 'workers' | 'households';
  message: string;
  sentAt: Date;
}

export interface WorkerBehaviorReport {
  id: string;
  reportedBy: string; // household ID
  workerId: string;
  jobId: string;
  reportType: 'misconduct' | 'excellence' | 'concern' | 'complaint';
  category: 'punctuality' | 'quality' | 'communication' | 'behavior' | 'safety' | 'other';
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'serious' | 'severe';
  actionRequested: string;
  evidenceFiles?: string[]; // file URLs
  witnessInfo?: string;
  incidentDate: Date;
  status: 'submitted' | 'under_review' | 'escalated_to_isange' | 'resolved' | 'closed';
  adminNotes?: string;
  isangeNotified: boolean;
  isangeReferenceNumber?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RwandanInsuranceCompany {
  id: string;
  name: string;
  code: string;
  type: 'health' | 'life' | 'accident' | 'comprehensive';
  coverage: string[];
  premiumRange: {
    min: number;
    max: number;
  };
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  eligibilityRequirements: string[];
  benefits: string[];
  claimProcess: string;
  isActive: boolean;
}

export interface WorkerSubscription {
  id: string;
  workerId: string;
  type: 'basic' | 'premium' | 'gold';
  features: SubscriptionFeature[];
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  autoRenewal: boolean;
  paymentHistory: SubscriptionPayment[];
}

export interface SubscriptionFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  date: Date;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  transactionId: string;
}

export interface AdvancedSearch {
  filters: {
    location?: {
      district?: string;
      sector?: string;
      radius?: number; // in km
    };
    services?: string[];
    availability?: {
      date?: Date;
      timeSlot?: string;
      duration?: number;
    };
    pricing?: {
      min?: number;
      max?: number;
    };
    rating?: {
      min: number;
      max: number;
    };
    experience?: {
      min: number; // in years
      max: number;
    };
    languages?: string[];
    certifications?: string[];
    backgroundCheck?: boolean;
    insurance?: boolean;
    urgentBooking?: boolean;
  };
  sortBy: 'nearest' | 'cheapest' | 'rating' | 'newest' | 'experience' | 'availability';
  results: WorkerSearchResult[];
}

export interface WorkerSearchResult {
  workerId: string;
  distance?: number;
  matchScore: number;
  availability: boolean;
  priceEstimate: number;
  responseTime: string;
}

export interface DashboardStats {
  totalWorkers: number;
  totalHouseholds: number;
  jobsCompleted: number;
  totalRevenue: number;
  totalVat: number;
  totalInsurance: number;
  totalPlatformFee: number;
}

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalWorkers: number;
    totalHouseholds: number;
    totalJobs: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
  visitors: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    sources: TrafficSource[];
  };
  satisfaction: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistribution;
    satisfiedClients: number;
    satisfactionTrend: number[];
  };
  financials: {
    monthlyRevenue: number[];
    serviceRevenue: ServiceRevenue[];
    trainingRevenue: number;
    subscriptionRevenue: number;
    expenses: number;
    profit: number;
  };
  services: {
    mostRequested: ServiceStats[];
    serviceGrowth: ServiceGrowth[];
    serviceRatings: ServiceRating[];
  };
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface RatingDistribution {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
}

export interface ServiceRevenue {
  serviceType: string;
  revenue: number;
  bookings: number;
  averagePrice: number;
}

export interface ServiceStats {
  serviceType: string;
  requests: number;
  completionRate: number;
  averageRating: number;
}

export interface ServiceGrowth {
  serviceType: string;
  growthPercentage: number;
  previousPeriod: number;
  currentPeriod: number;
}

export interface ServiceRating {
  serviceType: string;
  averageRating: number;
  totalReviews: number;
}

export interface PaymentHistory {
  id: string;
  userId: string;
  type: 'service' | 'training' | 'subscription' | 'insurance' | 'tax';
  description: string;
  amount: number;
  currency: 'RWF' | 'USD';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'mobile_money' | 'bank_transfer' | 'cash' | 'card';
  transactionId: string;
  fees: number;
  netAmount: number;
  date: Date;
  dueDate?: Date;
  receipt?: string; // file URL
  taxes?: TaxBreakdown;
}

export interface TaxBreakdown {
  vat: number;
  incomeTax: number;
  serviceCharge: number;
  total: number;
}

export interface LanguageSettings {
  current: 'en' | 'rw' | 'fr';
  available: LanguageOption[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UserProfile {
  id: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    nationality: string;
    nationalId: string;
    profilePicture?: string;
  };
  address: {
    street: string;
    sector: string;
    district: string;
    province: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    nationalIdVerified: boolean;
    backgroundCheckCompleted: boolean;
    verificationDate?: Date;
  };
  preferences: {
    language: string;
    notifications: NotificationPreferences;
    privacy: PrivacySettings;
    accessibility: AccessibilitySettings;
  };
  accountSettings: {
    twoFactorEnabled: boolean;
    passwordLastChanged: Date;
    loginHistory: LoginRecord[];
    deviceTokens: string[];
  };
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  jobUpdates: boolean;
  paymentNotifications: boolean;
  marketingEmails: boolean;
  systemUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'verified_users' | 'private';
  showLocation: boolean;
  showContactInfo: boolean;
  allowDirectContact: boolean;
  shareAnalytics: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  colorBlindMode: boolean;
}

export interface LoginRecord {
  timestamp: Date;
  ipAddress: string;
  device: string;
  location: string;
  success: boolean;
}
