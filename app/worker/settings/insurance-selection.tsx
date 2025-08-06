"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Shield, Phone, Mail, Globe } from "lucide-react"
import { rwandanInsuranceCompanies, type InsuranceCompany } from "@/lib/rwanda-insurance"
import { useToast } from "@/hooks/use-toast"

interface InsuranceSelectionProps {
  selectedInsuranceId?: string
  onInsuranceChange: (insuranceId: string) => void
}

export function InsuranceSelection({ selectedInsuranceId, onInsuranceChange }: InsuranceSelectionProps) {
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = React.useState<InsuranceCompany | null>(null)

  React.useEffect(() => {
    if (selectedInsuranceId) {
      const company = rwandanInsuranceCompanies.find(c => c.id === selectedInsuranceId)
      setSelectedCompany(company || null)
    }
  }, [selectedInsuranceId])

  const handleInsuranceSelect = (insuranceId: string) => {
    const company = rwandanInsuranceCompanies.find(c => c.id === insuranceId)
    if (company) {
      setSelectedCompany(company)
      onInsuranceChange(insuranceId)
      toast({
        title: "Insurance Selected",
        description: `You have selected ${company.name} as your insurance provider.`
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Insurance Provider
        </CardTitle>
        <CardDescription>
          Choose your preferred Rwandan insurance company for health and work coverage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="insurance-select">Select Insurance Company</Label>
          <Select value={selectedInsuranceId} onValueChange={handleInsuranceSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your insurance provider" />
            </SelectTrigger>
            <SelectContent>
              {rwandanInsuranceCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({company.fullName})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompany && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">{selectedCompany.name}</CardTitle>
              <CardDescription>{selectedCompany.fullName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Services Offered:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.services.map((service, index) => (
                    <Badge key={index} variant="secondary">{service}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Coverage Includes:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.coverage.map((coverage, index) => (
                    <Badge key={index} variant="outline">{coverage}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCompany.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCompany.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={selectedCompany.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => window.open(selectedCompany.website, '_blank')}
                >
                  Learn More & Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Selecting an insurance provider here helps us calculate 
            accurate deductions from your earnings. You will need to apply directly with 
            the insurance company for coverage.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}