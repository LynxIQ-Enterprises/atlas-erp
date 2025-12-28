import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Business } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

const SELECTED_BUSINESS_KEY = 'selected_business_id';

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
  error: string | null;
  switchBusiness: (businessId: string) => void;
  addBusiness: (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>) => Promise<Business | null>;
  refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch businesses for the current user
  const fetchBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get admin_user record
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_uid', user.id)
        .maybeSingle();

      if (adminError) throw adminError;
      if (!adminUser) {
        setBusinesses([]);
        setCurrentBusiness(null);
        setIsLoading(false);
        return;
      }

      // Get business access
      const { data: accessData, error: accessError } = await supabase
        .from('admin_business_access')
        .select('business_id')
        .eq('admin_user_id', adminUser.id);

      if (accessError) throw accessError;
      const businessIds = accessData?.map(a => a.business_id) || [];

      if (businessIds.length === 0) {
        setBusinesses([]);
        setCurrentBusiness(null);
        setIsLoading(false);
        return;
      }

      // Fetch actual businesses
      const { data: businessesData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .in('id', businessIds)
        .order('name');

      if (businessError) throw businessError;

      const typedBusinesses = (businessesData || []) as Business[];
      setBusinesses(typedBusinesses);

      // Restore or select default business
      const savedBusinessId = localStorage.getItem(SELECTED_BUSINESS_KEY);
      const savedBusiness = typedBusinesses.find(b => b.id === savedBusinessId);

      if (savedBusiness) {
        setCurrentBusiness(savedBusiness);
      } else {
        setCurrentBusiness(typedBusinesses[0] || null);
        if (typedBusinesses[0]) localStorage.setItem(SELECTED_BUSINESS_KEY, typedBusinesses[0].id);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
      setError('Failed to load businesses');
      setBusinesses([]);
      setCurrentBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchBusinesses();
    } else if (!authLoading && !user) {
      // Auth finished but no user
      setBusinesses([]);
      setCurrentBusiness(null);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const switchBusiness = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setCurrentBusiness(business);
      localStorage.setItem(SELECTED_BUSINESS_KEY, businessId);
      toast({
        title: 'Business switched',
        description: `Now viewing ${business.name}`,
      });
    }
  };

  const addBusiness = async (businessData: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business | null> => {
    if (!user) return null;

    try {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_uid', user.id)
        .single();
      if (adminError) throw adminError;

      const { data: newBusiness, error: businessError } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();
      if (businessError) throw businessError;

      await supabase.from('admin_business_access').insert({
        admin_user_id: adminUser.id,
        business_id: newBusiness.id,
      });

      await fetchBusinesses();

      toast({
        title: 'Business created',
        description: `${newBusiness.name} has been added.`,
      });

      return newBusiness as Business;
    } catch (err) {
      console.error('Error adding business:', err);
      toast({
        title: 'Error',
        description: 'Failed to create business.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const refreshBusinesses = async () => {
    await fetchBusinesses();
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        isLoading,
        error,
        switchBusiness,
        addBusiness,
        refreshBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusiness must be used within a BusinessProvider');
  return context;
}
