"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, FileDown, Trash2, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { getHouseholds, deleteHousehold, type Household } from "./actions"
import { StatusBadge } from "@/components/ui/status-components"

const SkeletonRow = React.memo(() => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell>
            <Skeleton className="h-8 w-8" />
        </TableCell>
    </TableRow>
))

SkeletonRow.displayName = "SkeletonRow"

// Utility to format date
function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

// Utility to export CSV
function exportToCSV(households: Household[]) {
    const headers = ["Full Name", "Email", "Phone", "Status", "Date Joined"]
    const rows = households.map(h => [
        `"${h.fullName}"`,
        `"${h.email}"`,
        `"${h.phone}"`,
        `"${h.status}"`,
        `"${formatDate(h.dateJoined)}"`
    ])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "households.csv"
    a.click()
    URL.revokeObjectURL(url)
}

export default function AdminHouseholdsPage() {
    const [households, setHouseholds] = React.useState<Household[]>([])
    const [filteredHouseholds, setFilteredHouseholds] = React.useState<Household[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState("")
    const { toast } = useToast()

    // Debounce search input
    const [debouncedSearch, setDebouncedSearch] = React.useState(searchTerm)
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const fetchHouseholds = React.useCallback(async () => {
        setLoading(true)
        try {
            const fetchedHouseholds = await getHouseholds()
            setHouseholds(fetchedHouseholds)
            setFilteredHouseholds(fetchedHouseholds)
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch household data.",
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    React.useEffect(() => {
        fetchHouseholds()
    }, [fetchHouseholds])

    React.useEffect(() => {
        const results = households.filter(h =>
            h.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            h.email.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
        setFilteredHouseholds(results)
    }, [debouncedSearch, households])

    const handleDelete = async (householdId: string, householdName: string) => {
        const result = await deleteHousehold(householdId)
        if (result.success) {
            toast({
                title: "Household Deleted",
                description: `The account for "${householdName}" has been deleted.`
            })
            fetchHouseholds()
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || `Could not delete account for "${householdName}".`
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Households</h1>
                    <p className="text-muted-foreground">View and manage household accounts.</p>
                </div>
                <Button
                    onClick={() => exportToCSV(filteredHouseholds)}
                    aria-label="Export household list as CSV"
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export List
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Household Accounts</CardTitle>
                            <CardDescription>A list of all registered households in the system.</CardDescription>
                        </div>
                        <div className="w-full max-w-sm">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search households..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    aria-label="Search households"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : filteredHouseholds.length > 0 ? (
                                filteredHouseholds.map((household) => (
                                    <TableRow key={household.id}>
                                        <TableCell className="font-medium">{household.fullName}</TableCell>
                                        <TableCell>{household.email}</TableCell>
                                        <TableCell>{household.phone}</TableCell>
                                        <TableCell><StatusBadge statusId={household.status} type="user" /></TableCell>
                                        <TableCell>{formatDate(household.dateJoined)}</TableCell>
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
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the household account for {household.fullName}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(household.id, household.fullName)}>
                                                            Yes, delete household
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
                                        No households found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
