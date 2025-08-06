export interface InsuranceCompany {
  id: string;
  name: string;
  fullName: string;
  website: string;
  phone: string;
  email: string;
  services: string[];
  coverage: string[];
}

export const rwandanInsuranceCompanies: InsuranceCompany[] = [
  {
    id: 'sonarwa',
    name: 'SONARWA',
    fullName: 'Société Nationale d\'Assurance du Rwanda',
    website: 'https://www.sonarwa.rw',
    phone: '+250 252 573 974',
    email: 'info@sonarwa.rw',
    services: ['Health Insurance', 'Life Insurance', 'Motor Insurance', 'Property Insurance'],
    coverage: ['Medical expenses', 'Accident coverage', 'Disability benefits', 'Life coverage']
  },
  {
    id: 'radiant',
    name: 'RADIANT',
    fullName: 'Radiant Insurance Company',
    website: 'https://www.radiant.rw',
    phone: '+250 252 570 245',
    email: 'info@radiant.rw',
    services: ['Health Insurance', 'Motor Insurance', 'Travel Insurance', 'Property Insurance'],
    coverage: ['Comprehensive health', 'Emergency services', 'Outpatient care', 'Hospitalization']
  },
  {
    id: 'sanlam',
    name: 'SANLAM',
    fullName: 'Sanlam Life Insurance Rwanda',
    website: 'https://www.sanlam.rw',
    phone: '+250 252 580 245',
    email: 'info@sanlam.rw',
    services: ['Life Insurance', 'Health Insurance', 'Pension Plans', 'Investment Plans'],
    coverage: ['Life benefits', 'Health coverage', 'Retirement planning', 'Investment returns']
  },
  {
    id: 'prime',
    name: 'PRIME',
    fullName: 'Prime Insurance Company Rwanda',
    website: 'https://www.prime.rw',
    phone: '+250 252 575 123',
    email: 'info@prime.rw',
    services: ['Health Insurance', 'Motor Insurance', 'Property Insurance', 'Marine Insurance'],
    coverage: ['Medical treatment', 'Vehicle protection', 'Property damage', 'Cargo insurance']
  },
  {
    id: 'corar',
    name: 'CORAR',
    fullName: 'Compagnie Rwandaise d\'Assurance et de Réassurance',
    website: 'https://www.corar.rw',
    phone: '+250 252 572 456',
    email: 'info@corar.rw',
    services: ['Health Insurance', 'Life Insurance', 'Motor Insurance', 'Agricultural Insurance'],
    coverage: ['Health benefits', 'Life protection', 'Vehicle coverage', 'Crop insurance']
  },
  {
    id: 'inyangamugayo',
    name: 'INYANGAMUGAYO',
    fullName: 'Inyangamugayo Mutual Health Insurance',
    website: 'https://www.inyangamugayo.rw',
    phone: '+250 252 578 789',
    email: 'info@inyangamugayo.rw',
    services: ['Mutual Health Insurance', 'Community Insurance', 'Family Plans'],
    coverage: ['Basic health services', 'Emergency care', 'Preventive care', 'Family coverage']
  }
];

export function getInsuranceCompanyById(id: string): InsuranceCompany | undefined {
  return rwandanInsuranceCompanies.find(company => company.id === id);
}

export function getInsuranceCompanyOptions() {
  return rwandanInsuranceCompanies.map(company => ({
    id: company.id,
    label: company.name,
    fullName: company.fullName
  }));
}