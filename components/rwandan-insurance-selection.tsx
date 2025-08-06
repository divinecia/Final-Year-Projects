'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  Heart, 
  Car, 
  Home, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  CheckCircle,
  Info
} from 'lucide-react';
import { RwandanInsuranceCompany } from '@/lib/types/enhanced-system';

interface InsuranceSelectionProps {
  workerId: string;
  onInsuranceSelected?: (insurance: RwandanInsuranceCompany) => void;
}

export function RwandanInsuranceSelection({ workerId, onInsuranceSelected }: InsuranceSelectionProps) {
  const [insuranceCompanies, setInsuranceCompanies] = useState<RwandanInsuranceCompany[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<RwandanInsuranceCompany | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'health' | 'life' | 'accident' | 'comprehensive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<RwandanInsuranceCompany | null>(null);

  const loadInsuranceCompanies = useCallback(async () => {
    try {
      // This would fetch from a Firestore collection of Rwandan insurance companies
      const mockInsuranceCompanies: RwandanInsuranceCompany[] = [
        {
          id: 'sonarwa',
          name: 'SONARWA General Insurance Company',
          code: 'SONARWA',
          type: 'comprehensive',
          coverage: [
            'Health Insurance',
            'Life Insurance', 
            'Motor Vehicle Insurance',
            'Property Insurance',
            'Professional Indemnity',
            'Travel Insurance'
          ],
          premiumRange: { min: 50000, max: 500000 },
          contactInfo: {
            phone: '+250788300000',
            email: 'info@sonarwa.rw',
            website: 'https://www.sonarwa.rw',
            address: 'KG 622 St, Kigali, Rwanda'
          },
          eligibilityRequirements: [
            'Must be Rwandan citizen or legal resident',
            'Valid national ID',
            'Proof of employment',
            'Medical examination for health insurance'
          ],
          benefits: [
            'Comprehensive coverage',
            'Quick claim processing',
            '24/7 customer support',
            'Network hospitals across Rwanda'
          ],
          claimProcess: 'Submit claim form with supporting documents. Processing time: 5-10 business days.',
          isActive: true
        },
        {
          id: 'radiant',
          name: 'Radiant Insurance Company',
          code: 'RADIANT',
          type: 'health',
          coverage: [
            'Medical Insurance',
            'Hospitalization',
            'Outpatient Services',
            'Maternity Care',
            'Emergency Services'
          ],
          premiumRange: { min: 30000, max: 200000 },
          contactInfo: {
            phone: '+250788123456',
            email: 'info@radiant.rw',
            website: 'https://www.radiant.rw',
            address: 'KN 4 Ave, Kigali, Rwanda'
          },
          eligibilityRequirements: [
            'Valid ID card',
            'Employment verification',
            'Health assessment'
          ],
          benefits: [
            'Affordable premiums',
            'Wide hospital network',
            'Preventive care coverage',
            'Family coverage options'
          ],
          claimProcess: 'Online claim submission available. Direct billing with network providers.',
          isActive: true
        },
        {
          id: 'phoenix',
          name: 'Phoenix of East Africa Assurance',
          code: 'PHOENIX',
          type: 'life',
          coverage: [
            'Life Insurance',
            'Term Life',
            'Whole Life',
            'Group Life',
            'Funeral Cover'
          ],
          premiumRange: { min: 25000, max: 300000 },
          contactInfo: {
            phone: '+250788987654',
            email: 'info@phoenix.rw',
            website: 'https://www.phoenix.rw',
            address: 'KG 11 Ave, Kigali, Rwanda'
          },
          eligibilityRequirements: [
            'Age 18-65 years',
            'Medical examination',
            'Proof of income'
          ],
          benefits: [
            'Flexible premium payments',
            'Death benefit',
            'Investment component',
            'Policy loans available'
          ],
          claimProcess: 'Submit death certificate and policy documents. Payout within 30 days.',
          isActive: true
        },
        {
          id: 'sanlam',
          name: 'Sanlam Rwanda',
          code: 'SANLAM',
          type: 'comprehensive',
          coverage: [
            'Life Insurance',
            'Pension Plans',
            'Investment Products',
            'Health Insurance',
            'Education Plans'
          ],
          premiumRange: { min: 40000, max: 600000 },
          contactInfo: {
            phone: '+250788555999',
            email: 'info@sanlam.rw',
            website: 'https://www.sanlam.rw',
            address: 'KG 7 Ave, Kigali, Rwanda'
          },
          eligibilityRequirements: [
            'Minimum age 18 years',
            'Regular income',
            'Medical underwriting'
          ],
          benefits: [
            'International coverage',
            'Investment growth',
            'Retirement planning',
            'Tax benefits'
          ],
          claimProcess: 'Digital claim processing. Average processing time: 7-14 days.',
          isActive: true
        },
        {
          id: 'rura',
          name: 'Rwanda Social Security Board (RSSB)',
          code: 'RSSB',
          type: 'health',
          coverage: [
            'Community-Based Health Insurance (Mutuelle)',
            'Medical Insurance Scheme',
            'Occupational Hazards Insurance',
            'Maternity Insurance'
          ],
          premiumRange: { min: 3000, max: 50000 },
          contactInfo: {
            phone: '+250252580600',
            email: 'info@rssb.rw',
            website: 'https://www.rssb.rw',
            address: 'RSSB Building, KG 7 Ave, Kigali'
          },
          eligibilityRequirements: [
            'Rwandan citizenship',
            'Contribution to social security',
            'Employment verification'
          ],
          benefits: [
            'Government subsidized',
            'Universal health coverage',
            'Affordable premiums',
            'Nationwide coverage'
          ],
          claimProcess: 'Use RSSB card at any affiliated health facility. No upfront payment required.',
          isActive: true
        }
      ];

      setInsuranceCompanies(mockInsuranceCompanies);
    } catch (error) {
      console.error('Error loading insurance companies:', error);
    }
  }, []);

  const loadWorkerInsurance = useCallback(async () => {
    try {
      // Load worker's current insurance selection
      console.log('Loading worker insurance for:', workerId);
      // This would query the worker's current insurance from Firestore
    } catch (error) {
      console.error('Error loading worker insurance:', error);
    }
  }, [workerId]);

  useEffect(() => {
    loadInsuranceCompanies();
    loadWorkerInsurance();
  }, [workerId, loadInsuranceCompanies, loadWorkerInsurance]);

  const handleSelectInsurance = async (insurance: RwandanInsuranceCompany) => {
    try {
      setSelectedInsurance(insurance);
      
      // Save selection to Firestore
      const workerInsuranceData = {
        workerId,
        insuranceCompanyId: insurance.id,
        selectedDate: new Date(),
        status: 'selected',
        premiumAmount: 0, // Will be determined based on coverage selection
        coverage: [],
        startDate: null,
        endDate: null
      };

      console.log('Saving insurance selection:', workerInsuranceData);
      
      if (onInsuranceSelected) {
        onInsuranceSelected(insurance);
      }
    } catch (error) {
      console.error('Error selecting insurance:', error);
    }
  };

  const openDetailsModal = (insurance: RwandanInsuranceCompany) => {
    setSelectedForDetails(insurance);
    setIsDetailsModalOpen(true);
  };

  const filteredCompanies = insuranceCompanies.filter(company => {
    const matchesType = filterType === 'all' || company.type === filterType;
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.coverage.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch && company.isActive;
  });

  const getInsuranceIcon = (type: RwandanInsuranceCompany['type']) => {
    switch (type) {
      case 'health': return <Heart className="w-6 h-6 text-red-500" />;
      case 'life': return <Shield className="w-6 h-6 text-blue-500" />;
      case 'accident': return <Car className="w-6 h-6 text-orange-500" />;
      case 'comprehensive': return <Home className="w-6 h-6 text-green-500" />;
      default: return <Shield className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeColor = (type: RwandanInsuranceCompany['type']) => {
    switch (type) {
      case 'health': return 'bg-red-100 text-red-800';
      case 'life': return 'bg-blue-100 text-blue-800';
      case 'accident': return 'bg-orange-100 text-orange-800';
      case 'comprehensive': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Choose Your Insurance Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Select from approved Rwandan insurance companies. All providers are regulated by the National Bank of Rwanda.
          </p>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Insurance Companies</Label>
              <Input
                id="search"
                placeholder="Search by name or coverage type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter">Filter by Type</Label>
              <Select value={filterType} onValueChange={(value: 'all' | 'health' | 'life' | 'accident' | 'comprehensive') => setFilterType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                  <SelectItem value="life">Life Insurance</SelectItem>
                  <SelectItem value="accident">Accident Insurance</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Selection */}
          {selectedInsurance && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium text-green-700">
                  Selected: {selectedInsurance.name}
                </span>
              </div>
            </div>
          )}

          {/* Insurance Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getInsuranceIcon(company.type)}
                      <div>
                        <h3 className="font-semibold text-sm">{company.name}</h3>
                        <Badge className={getTypeColor(company.type)}>
                          {company.type.charAt(0).toUpperCase() + company.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Coverage includes:</p>
                      <div className="space-y-1">
                        {company.coverage.slice(0, 3).map((coverage, index) => (
                          <div key={index} className="text-xs text-gray-700">
                            • {coverage}
                          </div>
                        ))}
                        {company.coverage.length > 3 && (
                          <div className="text-xs text-blue-600">
                            +{company.coverage.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-600">Premium Range:</p>
                      <p className="text-sm font-medium">
                        {company.premiumRange.min.toLocaleString()} - {company.premiumRange.max.toLocaleString()} RWF
                      </p>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="w-3 h-3 mr-1" />
                      {company.contactInfo.phone}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailsModal(company)}
                        className="flex-1"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelectInsurance(company)}
                        className="flex-1"
                        variant={selectedInsurance?.id === company.id ? "default" : "outline"}
                      >
                        {selectedInsurance?.id === company.id ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No insurance companies found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedForDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  {getInsuranceIcon(selectedForDetails.type)}
                  <span className="ml-2">{selectedForDetails.name}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Coverage</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedForDetails.coverage.map((coverage, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm">{coverage}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Eligibility Requirements</h4>
                  <ul className="space-y-1">
                    {selectedForDetails.eligibilityRequirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-700">• {req}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {selectedForDetails.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-700">• {benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Claim Process</h4>
                  <p className="text-sm text-gray-700">{selectedForDetails.claimProcess}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedForDetails.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedForDetails.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-gray-500" />
                      <a 
                        href={selectedForDetails.contactInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedForDetails.contactInfo.website}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{selectedForDetails.contactInfo.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    handleSelectInsurance(selectedForDetails);
                    setIsDetailsModalOpen(false);
                  }}>
                    Select This Insurance
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
