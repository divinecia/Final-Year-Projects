"use client"

import * as React from "react"
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getDashboardStats } from "../dashboard/actions"

// TODO: Fetch this data from backend in the future
type DashboardDatum = {
    month: string
    revenue: number
    jobs: number
    workers: number
    households: number
    activeUsers: number
    churnRate: number
    avgJobValue: number
    newJobs: number
    cancelledJobs: number
    avgCompletionTime: number
    feedbackScore: number
}

const dashboardData: DashboardDatum[] = [
    { month: "Jan", revenue: 400000, jobs: 24, workers: 20, households: 35, activeUsers: 50, churnRate: 2, avgJobValue: 16666, newJobs: 30, cancelledJobs: 2, avgCompletionTime: 3.2, feedbackScore: 4.5 },
    { month: "Feb", revenue: 300000, jobs: 13, workers: 25, households: 42, activeUsers: 60, churnRate: 1.8, avgJobValue: 23076, newJobs: 18, cancelledJobs: 1, avgCompletionTime: 2.9, feedbackScore: 4.6 },
    { month: "Mar", revenue: 500000, jobs: 38, workers: 32, households: 55, activeUsers: 75, churnRate: 2.1, avgJobValue: 13157, newJobs: 45, cancelledJobs: 3, avgCompletionTime: 3.5, feedbackScore: 4.7 },
    { month: "Apr", revenue: 478000, jobs: 39, workers: 40, households: 68, activeUsers: 80, churnRate: 2.3, avgJobValue: 12256, newJobs: 50, cancelledJobs: 4, avgCompletionTime: 3.1, feedbackScore: 4.8 },
    { month: "May", revenue: 689000, jobs: 48, workers: 55, households: 85, activeUsers: 95, churnRate: 1.5, avgJobValue: 14354, newJobs: 60, cancelledJobs: 2, avgCompletionTime: 2.8, feedbackScore: 4.9 },
    { month: "Jun", revenue: 539000, jobs: 38, workers: 62, households: 102, activeUsers: 110, churnRate: 1.2, avgJobValue: 14184, newJobs: 55, cancelledJobs: 1, avgCompletionTime: 2.6, feedbackScore: 5.0 },
]

export default function AdminReportsPage() {
    const [loading, setLoading] = React.useState(true)
    const { toast } = useToast()

    // Use useCallback for stable reference
    const fetchStats = React.useCallback(async () => {
        try {
            await getDashboardStats()
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to load report data." })
        } finally {
            setLoading(false)
        }
    }, [toast])

    React.useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const formatCurrency = (value: number) => `RWF ${new Intl.NumberFormat('en-US').format(value)}`

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">
                Gain insights into platform performance and user activity.
            </p>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Platform KPIs Overview</CardTitle>
                        <CardDescription>
                            Track revenue, jobs, users, churn, feedback, and more over the last 6 months.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-full h-64" aria-label="Loading KPI chart" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={dashboardData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) =>
                                            name === "Revenue (RWF)" || name === "Avg Job Value (RWF)"
                                                ? formatCurrency(Number(value))
                                                : value
                                        }
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" name="Revenue (RWF)" />
                                    <Area type="monotone" dataKey="jobs" stroke="#82ca9d" fill="#82ca9d" name="Jobs Completed" />
                                    <Area type="monotone" dataKey="activeUsers" stroke="#ffc658" fill="#ffc658" name="Active Users" />
                                    <Area type="monotone" dataKey="churnRate" stroke="#ff7300" fill="#ff7300" name="Churn Rate (%)" />
                                    <Area type="monotone" dataKey="feedbackScore" stroke="#00c49f" fill="#00c49f" name="Feedback Score" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Metrics Breakdown</CardTitle>
                        <CardDescription>
                            Visualize sign-ups, job stats, completion time, and cancellations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-full h-64" aria-label="Loading metrics chart" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dashboardData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) =>
                                            name === "Avg Job Value (RWF)"
                                                ? formatCurrency(Number(value))
                                                : value
                                        }
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="workers" stroke="#007bff" name="Workers Sign-ups" />
                                    <Line type="monotone" dataKey="households" stroke="#6f42c1" name="Households Sign-ups" />
                                    <Line type="monotone" dataKey="newJobs" stroke="#28a745" name="New Jobs" />
                                    <Line type="monotone" dataKey="cancelledJobs" stroke="#dc3545" name="Cancelled Jobs" />
                                    <Line type="monotone" dataKey="avgCompletionTime" stroke="#fd7e14" name="Avg Completion Time (hrs)" />
                                    <Line type="monotone" dataKey="avgJobValue" stroke="#20c997" name="Avg Job Value (RWF)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
