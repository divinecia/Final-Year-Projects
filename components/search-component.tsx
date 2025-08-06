"use client"

import * as React from "react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { Slider } from "../components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Search, Filter, X, Loader2 } from "lucide-react"
import { serviceOptions } from "../lib/services"
import { Badge } from "../components/ui/badge"

export interface SearchFilters {
  query: string
  serviceType: string
  location: string
  minRating: number
  maxPrice: number
  availability: string
}

interface SearchComponentProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
  loading?: boolean
}

export function SearchComponent({ filters, onFiltersChange, onSearch, loading }: SearchComponentProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const updateFilter = React.useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      onFiltersChange({ ...filters, [key]: value })
    },
    [filters, onFiltersChange]
  )

  const clearFilters = React.useCallback(() => {
    onFiltersChange({
      query: "",
      serviceType: "",
      location: "",
      minRating: 0,
      maxPrice: 100,
      availability: ""
    })
  }, [onFiltersChange])

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.serviceType) count++
    if (filters.location) count++
    if (filters.minRating > 0) count++
    if (filters.maxPrice < 100) count++
    if (filters.availability) count++
    return count
  }, [filters])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Find Workers</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Toggle advanced filters"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters {activeFiltersCount > 0 && <Badge className="ml-2">{activeFiltersCount}</Badge>}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or service..."
            value={filters.query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter("query", e.target.value)}
            className="flex-1"
            aria-label="Search input"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") onSearch()
            }}
          />
          <Button onClick={onSearch} disabled={loading} aria-label="Search">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select
                  value={filters.serviceType}
                  onValueChange={(value: string) => updateFilter("serviceType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any service</SelectItem>
                    {serviceOptions.map((service: { id: string; label: string }) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value: string) => updateFilter("location", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    <SelectItem value="kigali">Kigali</SelectItem>
                    <SelectItem value="northern">Northern Province</SelectItem>
                    <SelectItem value="southern">Southern Province</SelectItem>
                    <SelectItem value="eastern">Eastern Province</SelectItem>
                    <SelectItem value="western">Western Province</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Minimum Rating: {filters.minRating}/5</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value: number[]) => updateFilter("minRating", value[0])}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
                aria-label="Minimum rating"
              />
            </div>

            <div className="space-y-2">
              <Label>Maximum Price: ${filters.maxPrice}</Label>
              <Slider
                value={[filters.maxPrice]}
                onValueChange={(value: number[]) => updateFilter("maxPrice", value[0])}
                max={100}
                min={5}
                step={5}
                className="w-full"
                aria-label="Maximum price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={filters.availability}
                onValueChange={(value: string) => updateFilter("availability", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any time</SelectItem>
                  <SelectItem value="today">Available today</SelectItem>
                  <SelectItem value="this-week">Available this week</SelectItem>
                  <SelectItem value="weekend">Weekend only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters} aria-label="Clear filters">
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
              <Button onClick={onSearch} disabled={loading} aria-label="Apply filters">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Searching..." : "Apply Filters"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
