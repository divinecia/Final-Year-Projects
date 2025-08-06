"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, PlusCircle, FileDown, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PackageForm } from "./package-form"
import { getPackages, deletePackage, type ServicePackage } from "./actions"
import { serviceOptions } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const SkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><div className="flex flex-wrap gap-1"><Skeleton className="h-5 w-20 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell>
            <Skeleton className="h-8 w-8" />
        </TableCell>
    </TableRow>
)

const statusBadgeVariant = (status: string) => {
    switch (status) {
        case "active":
            return "default"
        case "inactive":
            return "secondary"
        default:
            return "outline"
    }
}

export default function AdminPackagesPage() {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [selectedPackage, setSelectedPackage] = React.useState<ServicePackage | null>(null);
    const [packages, setPackages] = React.useState<ServicePackage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [deletingId, setDeletingId] = React.useState<string | null>(null);
    const { toast } = useToast();

    const fetchPackages = React.useCallback(async () => {
        setLoading(true);
        try {
            const fetchedPackages = await getPackages();
            setPackages(fetchedPackages);
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch service packages.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleEdit = (pkg: ServicePackage) => {
        setSelectedPackage(pkg);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedPackage(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (packageId: string, packageName: string) => {
        setDeletingId(packageId);
        const result = await deletePackage(packageId);
        if (result.success) {
            toast({
                title: "Package Deleted",
                description: `Package "${packageName}" has been deleted.`
            });
            fetchPackages();
        } else {
             toast({
                variant: "destructive",
                title: "Error",
                description: `Could not delete package "${packageName}".`
            });
        }
        setDeletingId(null);
    };

    const getServiceName = React.useCallback(
        (serviceId: string) => serviceOptions.find(s => s.id === serviceId)?.label || serviceId,
        []
    );

    const filteredPackages = React.useMemo(
        () =>
            packages.filter(pkg =>
                pkg.name.toLowerCase().includes(search.toLowerCase())
            ),
        [packages, search]
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Service Packages</h1>
                    <p className="text-muted-foreground">Create and manage service packages for households.</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" aria-label="Export package list">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export List
                    </Button>
                    <Button onClick={handleAdd} aria-label="Add new package">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Package
                    </Button>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Available Packages</CardTitle>
                            <CardDescription>A list of all service packages offered on the platform.</CardDescription>
                        </div>
                        <div className="w-full max-w-sm">
                           <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search packages..."
                                    className="pl-8"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    aria-label="Search packages"
                                />
                           </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Package Name</TableHead>
                                <TableHead>Price (RWF)</TableHead>
                                <TableHead>Billing Cycle</TableHead>
                                <TableHead>Included Services</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {loading ? (
                             Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                           ) : filteredPackages.length > 0 ? (
                                filteredPackages.map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">{pkg.name}</TableCell>
                                        <TableCell>{pkg.price.toLocaleString()}</TableCell>
                                        <TableCell className="capitalize">{pkg.billingCycle.replace('-', ' ')}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {pkg.services.slice(0, 2).map(serviceId => (
                                                    <Badge key={serviceId} variant="secondary">{getServiceName(serviceId)}</Badge>
                                                ))}
                                                {pkg.services.length > 2 && <Badge variant="outline">+{pkg.services.length - 2} more</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusBadgeVariant(pkg.status)}
                                                className={pkg.status === 'active' ? 'bg-green-500 text-white' : ''}
                                            >
                                                {pkg.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost" aria-label="Open actions menu">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(pkg)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                disabled={deletingId === pkg.id}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the package &ldquo;{pkg.name}&rdquo;.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel disabled={deletingId === pkg.id}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(pkg.id, pkg.name)}
                                                            disabled={deletingId === pkg.id}
                                                        >
                                                            {deletingId === pkg.id ? "Deleting..." : "Yes, delete package"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No service packages found.
                                    </TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <PackageForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                onFormSubmit={fetchPackages}
                initialData={selectedPackage}
            />
        </div>
    )
}
