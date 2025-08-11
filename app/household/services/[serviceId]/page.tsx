
export const dynamic = 'force-static'

import * as React from "react";
import { getActiveWorkers, type Worker } from "@/app/household/find-worker/actions";
import { services } from "@/lib/services";
import { notFound } from "next/navigation";
import ServiceWorkersList from "./ServiceWorkersList";

// Generate static paths for all available services
export async function generateStaticParams() {
  return services.map((service) => ({
    serviceId: service.id,
  }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  
  // Find service from our static services array
  const service = services.find(s => s.id === serviceId);
  if (!service) {
    notFound();
  }

  // Get all workers and filter by service
  const allWorkers = await getActiveWorkers();
  // Extend Worker type to include available, verified, bio
  type WorkerExt = Worker & {
    available?: boolean;
    verified?: boolean;
    bio?: string;
  };
  const workers = allWorkers.filter(w => w.skills.includes(serviceId)) as WorkerExt[];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-1">Professionals for {service.name}</h1>
          <p className="text-base text-muted-foreground">Browse and book top-rated workers for this service.</p>
        </div>
      </div>

      <ServiceWorkersList workers={workers} />
    </div>
  );
}


