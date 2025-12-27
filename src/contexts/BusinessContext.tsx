import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Business } from '@/types/erp';

// Mock businesses for demo
const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    type: 'digital',
    currency: 'USD',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Urban Retail Store',
    type: 'physical',
    address: '123 Main Street, New York, NY',
    currency: 'USD',
    createdAt: new Date('2022-06-20'),
  },
  {
    id: '3',
    name: 'Digital Marketing Agency',
    type: 'digital',
    currency: 'USD',
    createdAt: new Date('2024-02-10'),
  },
];

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business) => void;
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(mockBusinesses[0]);

  const addBusiness = (business: Omit<Business, 'id' | 'createdAt'>) => {
    const newBusiness: Business = {
      ...business,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBusinesses([...businesses, newBusiness]);
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness,
        addBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
