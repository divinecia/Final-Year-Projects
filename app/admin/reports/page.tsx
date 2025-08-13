"use client"

import * as React from "react"
import {
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
// Use dynamic import for async server actions
// ...existing code...

// ...existing code...

export default function AdminReportsPage() {
    // Insurance and tax states
    type InsuranceCompany = {
        id: string;
        name: string;
        phone: string;
        email: string;
        website: string;
        services: string[];
        coverage: string[];
    }
    const [insuranceCompanies, setInsuranceCompanies] = React.useState<InsuranceCompany[]>([])
    const [taxFees, setTaxFees] = React.useState<{ vat: number; serviceFee: number; other: number }>({ vat: 0, serviceFee: 0, other: 0 })
    // Bar chart group data type
    type NotificationVolumeDatum = { channel: string; count: number }
    type SafetyReportDatum = { type: string; count: number }
    type ReviewRatingDatum = { rating: number; count: number }

    // Dynamic data states for each chart group
    type EmergencyRequestDatum = { urgency?: string }
    const [barChartData, setBarChartData] = React.useState<{
        notificationVolume?: NotificationVolumeDatum[]
        safetyReports?: SafetyReportDatum[]
        emergencyRequests?: EmergencyRequestDatum[]
        reviewRatings?: ReviewRatingDatum[]
    }>({})
    const [loading, setLoading] = React.useState(true)
    const { toast } = useToast()

    React.useEffect(() => {
        async function fetchBarMetrics() {
            setLoading(true)
            try {
                const barRes = await fetch('/api/metrics/barChartGroup')
                if (barRes.ok) {
                    const raw = await barRes.json()
                    setBarChartData({
                        notificationVolume: Object.entries(raw.notificationVolume || {}).map(([channel, count]) => ({ channel, count: Number(count) })),
                        safetyReports: Object.entries(raw.safetyReports || {}).map(([type, count]) => ({ type, count: Number(count) })),
                        emergencyRequests: raw.emergencyRequests || [],
                        reviewRatings: Object.entries(raw.reviewRatings || {}).map(([rating, count]) => ({ rating: Number(rating), count: Number(count) })),
                    })
                } else {
                    setBarChartData({})
                }
            } catch {
                setBarChartData({})
                toast({ variant: "destructive", title: "Error", description: "Failed to load report data." })
            } finally {
                setLoading(false)
            }
        }
        async function fetchBusinessInfo() {
            try {
                // Dynamically import server actions to avoid callable errors
                const actions = await import("@/app/admin/dashboard/actions")
                const [insurance, tax] = await Promise.all([
                    actions.getInsuranceCompanies(),
                    actions.getTaxFees()
                ])
                setInsuranceCompanies(insurance)
                setTaxFees(tax)
            } catch {
                toast({ variant: "destructive", title: "Error", description: "Failed to load insurance/tax info." })
            }
        }
        fetchBarMetrics()
        fetchBusinessInfo()
    }, [toast])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">
                Gain insights into platform performance and user activity.
            </p>
            {/* Chart Groups - modular, auto-adjust to new metrics */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* Business Info Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className="bg-purple-50">
                        <CardHeader>
                            <CardTitle>Tax & Fees</CardTitle>
                            <CardDescription>Current rates applied to jobs/payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm">
                                <li>VAT: <span className="font-semibold">{(taxFees.vat * 100).toFixed(2)}%</span></li>
                                <li>Service Fee: <span className="font-semibold">{(taxFees.serviceFee * 100).toFixed(2)}%</span></li>
                                <li>Other Fees: <span className="font-semibold">{(taxFees.other * 100).toFixed(2)}%</span></li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="bg-indigo-50 col-span-2">
                        <CardHeader>
                            <CardTitle>Insurance Companies</CardTitle>
                            <CardDescription>Partners we work with</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left font-semibold">Name</th>
                                            <th className="text-left font-semibold">Contact</th>
                                            <th className="text-left font-semibold">Services</th>
                                            <th className="text-left font-semibold">Coverage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insuranceCompanies.map((company) => (
                                            <tr key={company.id} className="border-b">
                                                <td>{company.name}</td>
                                                <td>
                                                    <div>{company.phone}</div>
                                                    <div>{company.email}</div>
                                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Website</a>
                                                </td>
                                                <td>{company.services.join(', ')}</td>
                                                <td>{company.coverage.join(', ')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className="bg-blue-50">
                        <CardHeader>
                            <CardTitle>Total Notifications</CardTitle>
                            <CardDescription>Breakdown by channel</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{Array.isArray(barChartData.notificationVolume) ? barChartData.notificationVolume.reduce((sum, d) => sum + d.count, 0) : 0}</span>
                            <ul className="mt-2 text-sm">
                                {Array.isArray(barChartData.notificationVolume)
                                    ? barChartData.notificationVolume.map(d => (
                                        <li key={d.channel}>{d.channel}: <span className="font-semibold">{d.count}</span></li>
                                    ))
                                    : null}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                        <CardHeader>
                            <CardTitle>Total Safety Reports</CardTitle>
                            <CardDescription>Breakdown by incident type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{Array.isArray(barChartData.safetyReports) ? barChartData.safetyReports.reduce((sum, d) => sum + d.count, 0) : 0}</span>
                            <ul className="mt-2 text-sm">
                                {Array.isArray(barChartData.safetyReports)
                                    ? barChartData.safetyReports.map(d => (
                                        <li key={d.type}>{d.type}: <span className="font-semibold">{d.count}</span></li>
                                    ))
                                    : null}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50">
                        <CardHeader>
                            <CardTitle>Total Emergency Requests</CardTitle>
                            <CardDescription>Breakdown by urgency</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{Array.isArray(barChartData.emergencyRequests) ? barChartData.emergencyRequests.length : 0}</span>
                            <ul className="mt-2 text-sm">
                                {(() => {
                                    const grouped: Record<string, number> = {};
                                    (barChartData.emergencyRequests || []).forEach((req: EmergencyRequestDatum) => {
                                        const urgency = req.urgency || 'unknown';
                                        grouped[urgency] = (grouped[urgency] || 0) + 1;
                                    });
                                    return Object.entries(grouped).map(([urgency, count]) => (
                                        <li key={urgency}>{urgency}: <span className="font-semibold">{count as number}</span></li>
                                    ));
                                })()}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="bg-yellow-50">
                        <CardHeader>
                            <CardTitle>Avg. Review Rating</CardTitle>
                            <CardDescription>Breakdown by rating</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">
                                {(() => {
                                    const ratings = barChartData.reviewRatings || []
                                    const total = ratings.reduce((sum, d) => sum + d.rating * d.count, 0)
                                    const count = ratings.reduce((sum, d) => sum + d.count, 0)
                                    return count ? (total / count).toFixed(2) : '0.00'
                                })()}
                            </span>
                            <ul className="mt-2 text-sm">
                                {Array.isArray(barChartData.reviewRatings)
                                    ? barChartData.reviewRatings.map(d => (
                                        <li key={d.rating}>Rating {d.rating}: <span className="font-semibold">{d.count}</span></li>
                                    ))
                                    : null}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                {/* Notification Volume by Channel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Volume by Channel</CardTitle>
                        <CardDescription>Stacked bar chart: in-app vs email</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-full h-64" aria-label="Loading bar chart" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={barChartData.notificationVolume || []}
                                    aria-label="Notification Volume by Channel"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="channel" label={{ value: 'Channel', position: 'insideBottom', offset: -5 }} />
                                    <YAxis allowDecimals={false} label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" name="Volume" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                {/* Safety Reports by Type */}
                <Card>
                    <CardHeader>
                        <CardTitle>Safety Reports by Type</CardTitle>
                        <CardDescription>Categorized incident types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-full h-64" aria-label="Loading bar chart" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={barChartData.safetyReports || []}
                                    aria-label="Safety Reports by Type"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" label={{ value: 'Incident Type', position: 'insideBottom', offset: -5 }} />
                                    <YAxis allowDecimals={false} label={{ value: 'Reports', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#82ca9d" name="Reports" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                {/* Emergency Service Requests by Urgency */}
                <Card>
                    <CardHeader>
                        <CardTitle>Emergency Service Requests</CardTitle>
                        <CardDescription>Bar chart for time/location-based urgency</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-full h-64" aria-label="Loading bar chart" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
  data={(() => {
    // Group emergencyRequests by urgency
    const grouped: Record<string, number> = {};
    (barChartData.emergencyRequests || []).forEach((req: EmergencyRequestDatum) => {
      const urgency = req.urgency || 'unknown';
      grouped[urgency] = (grouped[urgency] || 0) + 1;
    });
    return Object.entries(grouped).map(([urgency, count]) => ({ urgency, count }));
  })()}
                                    aria-label="Emergency Service Requests by Urgency"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="urgency" label={{ value: 'Urgency', position: 'insideBottom', offset: -5 }} />
                                    <YAxis allowDecimals={false} label={{ value: 'Requests', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#dc3545" name="Requests" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                {/* Review Ratings Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Review Ratings Distribution</CardTitle>
                        <CardDescription>Histogram to show frequency of each rating</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-full h-64" aria-label="Loading bar chart" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={barChartData.reviewRatings || []}
                                    aria-label="Review Ratings Distribution"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="rating" label={{ value: 'Rating', position: 'insideBottom', offset: -5 }} />
                                    <YAxis allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#ffc658" name="Ratings" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
