import React from 'react';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import {
  getJobStatusOptions,
  getPaymentStatusOptions,
  getPayFrequencyOptions,
  getUserRoleOptions,
} from '../../lib/system-config';

// Utility: fallback options for each type
const fallbackOptions = {
  job: [
    { id: 'open', label: 'Open', color: 'green' },
    { id: 'assigned', label: 'Assigned', color: 'blue' },
    { id: 'in_progress', label: 'In Progress', color: 'yellow' },
    { id: 'completed', label: 'Completed', color: 'green' },
    { id: 'cancelled', label: 'Cancelled', color: 'red' },
  ],
  payment: [
    { id: 'pending', label: 'Pending', color: 'yellow' },
    { id: 'completed', label: 'Completed', color: 'green' },
    { id: 'failed', label: 'Failed', color: 'red' },
    { id: 'cancelled', label: 'Cancelled', color: 'red' },
  ],
  payFrequency: [
    { id: 'per_hour', label: 'Per Hour' },
    { id: 'per_day', label: 'Per Day' },
    { id: 'per_week', label: 'Per Week' },
    { id: 'per_month', label: 'Per Month' },
  ],
  userRole: [
    { id: 'worker', label: 'Worker', color: 'green' },
    { id: 'household', label: 'Household', color: 'blue' },
    { id: 'admin', label: 'Administrator', color: 'purple' },
  ],
};

// Utility: badge color mapping
const badgeColorMap: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive'; className: string }
> = {
  green: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
  yellow: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  red: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
  blue: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  orange: { variant: 'default', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  purple: { variant: 'default', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  gray: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 border-gray-200' },
};

// Status Badge Component
interface StatusBadgeProps {
  statusId: string;
  type: 'job' | 'payment' | 'user';
  className?: string;
}

export function StatusBadge({ statusId, type, className = '' }: StatusBadgeProps) {
  const [statusData, setStatusData] = React.useState<{ label: string; color: string } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function loadStatus() {
      try {
        let options: Array<{ id: string; label: string; color: string }> = [];
        switch (type) {
          case 'job':
            options = (await getJobStatusOptions()).map(opt => ({
              ...opt,
              color: opt.color ?? 'gray',
            }));
            break;
          case 'payment':
            options = (await getPaymentStatusOptions()).map(opt => ({
              ...opt,
              color: opt.color ?? 'gray',
            }));
            break;
          case 'user': {
            const userRoles = await getUserRoleOptions();
            options = userRoles.map((role: { id: string; label: string }) => ({
              id: role.id,
              label: role.label,
              color:
                role.id === 'admin'
                  ? 'purple'
                  : role.id === 'worker'
                  ? 'green'
                  : 'blue',
            }));
            break;
          }
        }
        const status = options.find((opt) => opt.id === statusId);
        if (isMounted) {
          setStatusData(status ?? { label: statusId, color: 'gray' });
        }
      } catch {
        if (isMounted) setStatusData({ label: statusId, color: 'gray' });
      }
    }
    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [statusId, type]);

  if (!statusData) {
    return (
      <Badge variant="secondary" className={className}>
        Loading...
      </Badge>
    );
  }

  const { variant, className: colorClass } =
    badgeColorMap[statusData.color] ?? badgeColorMap.gray;

  return (
    <Badge variant={variant} className={`${colorClass} ${className}`}>
      {statusData.label}
    </Badge>
  );
}

// Status Select Component
interface StatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  type: 'job' | 'payment' | 'payFrequency' | 'userRole';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StatusSelect({
  value,
  onValueChange,
  type,
  placeholder = 'Select status...',
  disabled = false,
  className = '',
}: StatusSelectProps) {
  const [options, setOptions] = React.useState<
    Array<{ id: string; label: string; description?: string }>
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function loadOptions() {
      setIsLoading(true);
      try {
        let optionsData: Array<{ id: string; label: string; description?: string }> = [];
        switch (type) {
          case 'job':
            optionsData = await getJobStatusOptions();
            break;
          case 'payment':
            optionsData = await getPaymentStatusOptions();
            break;
          case 'payFrequency':
            optionsData = await getPayFrequencyOptions();
            break;
          case 'userRole':
            optionsData = await getUserRoleOptions();
            break;
        }
        if (isMounted) setOptions(optionsData);
      } catch {
        if (isMounted) setOptions(fallbackOptions[type] ?? []);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [type]);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Loading options...
          </SelectItem>
        ) : (
          options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
