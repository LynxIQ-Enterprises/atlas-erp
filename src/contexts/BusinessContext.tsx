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
  const { user, session } = useAuth();
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
      // First get the admin_user record
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminError) {
        console.error('Error fetching admin user:', adminError);
        throw adminError;
      }

      if (!adminUser) {
        // User is authenticated but not an admin - this is a new signup
        setBusinesses([]);
        setCurrentBusiness(null);
        setIsLoading(false);
        return;
      }

      // Then get businesses via admin_business_access
      const { data: accessData, error: accessError } = await supabase
        .from('admin_business_access')
        .select('business_id')
        .eq('admin_user_id', adminUser.id);

      if (accessError) {
        console.error('Error fetching business access:', accessError);
        throw accessError;
      }

      if (!accessData || accessData.length === 0) {
        setBusinesses([]);
        setCurrentBusiness(null);
        setIsLoading(false);
        return;
      }

      const businessIds = accessData.map(a => a.business_id);

      // Fetch the actual business data
      const { data: businessesData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .in('id', businessIds)
        .order('name');

      if (businessError) {
        console.error('Error fetching businesses:', businessError);
        throw businessError;
      }

      const typedBusinesses = (businessesData || []) as Business[];
      setBusinesses(typedBusinesses);

      // Restore selected business from localStorage
      const savedBusinessId = localStorage.getItem(SELECTED_BUSINESS_KEY);
      const savedBusiness = typedBusinesses.find(b => b.id === savedBusinessId);
      
      if (savedBusiness) {
        setCurrentBusiness(savedBusiness);
      } else if (typedBusinesses.length > 0) {
        setCurrentBusiness(typedBusinesses[0]);
        localStorage.setItem(SELECTED_BUSINESS_KEY, typedBusinesses[0].id);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
      setError('Failed to load businesses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

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
      // Get admin user ID
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;

      // Create business
      const { data: newBusiness, error: businessError } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (businessError) throw businessError;

      // Grant access to the admin
      const { error: accessError } = await supabase
        .from('admin_business_access')
        .insert({
          admin_user_id: adminUser.id,
          business_id: newBusiness.id,
        });

      if (accessError) throw accessError;

      // Refresh businesses list
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
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
