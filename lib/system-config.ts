import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// System Configuration Types
export interface PayFrequency {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface JobStatus {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface UserRole {
  id: string;
  label: string;
  description: string;
  permissions: string[];
}

export interface PaymentStatus {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface SystemConfig {
  payFrequencies: Record<string, PayFrequency>;
  jobStatuses: Record<string, JobStatus>;
  userRoles: Record<string, UserRole>;
  paymentStatuses: Record<string, PaymentStatus>;
  lastUpdated: string;
}

type Option<T extends { id: string; label: string }> = Pick<T, 'id' | 'label'> & Partial<T>;

// Cache for system configuration
let systemConfigCache: SystemConfig | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Type guard for SystemConfig
 */
function isSystemConfig(data: unknown): data is SystemConfig {
  if (
    typeof data !== 'object' ||
    data === null
  ) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.payFrequencies === 'object' && obj.payFrequencies !== null &&
    typeof obj.jobStatuses === 'object' && obj.jobStatuses !== null &&
    typeof obj.userRoles === 'object' && obj.userRoles !== null &&
    typeof obj.paymentStatuses === 'object' && obj.paymentStatuses !== null &&
    typeof obj.lastUpdated === 'string'
  );
}

/**
 * Get system configuration from Firestore, with caching and fallback.
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  const now = Date.now();

  if (systemConfigCache && now - configCacheTime < CONFIG_CACHE_DURATION) {
    return systemConfigCache;
  }

  try {
    const configDoc = await getDoc(doc(db, 'system', 'config'));
    if (configDoc.exists()) {
      const data = configDoc.data();
      if (isSystemConfig(data)) {
        systemConfigCache = data;
        configCacheTime = now;
        return data;
      }
      throw new Error('Invalid system config structure');
    } else {
      throw new Error('System config document not found');
    }
  } catch (error) {
    console.error('Error fetching system config:', error);
    return getFallbackSystemConfig();
  }
}

/**
 * Generic helper to map options for dropdowns.
 */
function mapOptions<T extends { id: string; label: string }>(
  items: Record<string, T>,
  fields: Array<keyof T>
): Option<T>[] {
  return Object.values(items).map(item => {
    const option: Option<T> = { id: item.id, label: item.label } as Option<T>;
    for (const field of fields) {
      if (field !== 'id' && field !== 'label') {
        (option as Record<string, unknown>)[field as string] = item[field];
      }
    }
    return option;
  });
}

/**
 * Get pay frequency options for dropdowns.
 */
export async function getPayFrequencyOptions(): Promise<Option<PayFrequency>[]> {
  const config = await getSystemConfig();
  return mapOptions(config.payFrequencies, ['description']);
}

/**
 * Get job status options for dropdowns.
 */
export async function getJobStatusOptions(): Promise<Option<JobStatus>[]> {
  const config = await getSystemConfig();
  return mapOptions(config.jobStatuses, ['color']);
}

/**
 * Get user role options for dropdowns.
 */
export async function getUserRoleOptions(): Promise<Option<UserRole>[]> {
  const config = await getSystemConfig();
  return mapOptions(config.userRoles, ['description']);
}

/**
 * Get payment status options for dropdowns.
 */
export async function getPaymentStatusOptions(): Promise<Option<PaymentStatus>[]> {
  const config = await getSystemConfig();
  return mapOptions(config.paymentStatuses, ['color']);
}

/**
 * Calculate salary based on pay frequency.
 * @param baseHourlyRate - The base hourly rate.
 * @param payFrequencyId - The pay frequency identifier.
 * @returns The calculated salary.
 */
export async function calculateSalary(baseHourlyRate: number, payFrequencyId: string): Promise<number> {
  const config = await getSystemConfig();
  const frequency = config.payFrequencies[payFrequencyId];
  return frequency ? baseHourlyRate * frequency.multiplier : baseHourlyRate;
}

/**
 * Fallback system configuration (offline/error fallback).
 */
function getFallbackSystemConfig(): SystemConfig {
  return {
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
    lastUpdated: new Date().toISOString()
  } as const;
}

/**
 * Clear configuration cache (useful for testing or forced refresh).
 */
export function clearSystemConfigCache(): void {
  systemConfigCache = null;
  configCacheTime = 0;
}
