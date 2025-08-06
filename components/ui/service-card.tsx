import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import type { Service } from '../../lib/services-api';

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
  selected?: boolean;
}

export function ServiceCard({ service, onClick, selected = false }: ServiceCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl" role="img" aria-label={service.name}>
            {service.icon}
          </div>
          <Badge variant="secondary" className="text-xs">
            {service.category}
          </Badge>
        </div>
        <CardTitle className="text-lg">{service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {service.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-primary">
            From {service.basePrice.toLocaleString()} RWF/hour
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface ServiceGridProps {
  services: Service[];
  selectedService?: string;
  onServiceSelect?: (serviceId: string) => void;
  className?: string;
}

export function ServiceGrid({ 
  services, 
  selectedService, 
  onServiceSelect,
  className = "" 
}: ServiceGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={selectedService === service.id}
          onClick={() => onServiceSelect?.(service.id)}
        />
      ))}
    </div>
  );
}

interface ServicesByCategory {
  [category: string]: Service[];
}

interface ServiceCategoriesProps {
  services: Service[];
  selectedService?: string;
  onServiceSelect?: (serviceId: string) => void;
}

export function ServiceCategories({ 
  services, 
  selectedService, 
  onServiceSelect 
}: ServiceCategoriesProps) {
  // Group services by category
  const servicesByCategory = React.useMemo(() => {
    return services.reduce((acc: ServicesByCategory, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});
  }, [services]);

  const categoryNames = {
    cleaning: 'Cleaning Services',
    culinary: 'Cooking & Kitchen',
    care: 'Care Services',
    outdoor: 'Outdoor & Maintenance',
    security: 'Security Services',
    textile: 'Laundry & Textiles',
    specialized: 'Specialized Services'
  };

  return (
    <div className="space-y-8">
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold mb-4">
            {categoryNames[category as keyof typeof categoryNames] || category}
          </h3>
          <ServiceGrid
            services={categoryServices}
            selectedService={selectedService}
            onServiceSelect={onServiceSelect}
          />
        </div>
      ))}
    </div>
  );
}
