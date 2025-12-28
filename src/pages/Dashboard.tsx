import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCompactCurrency, formatPercentage } from '@/lib/localization';
import { LoadingState, EmptyState } from '@/components/ui/LoadingState';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalInventory: number;
}

export default function Dashboard() {
  const { currentBusiness, isLoading: businessLoading } = useBusiness();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBusiness) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch invoice totals
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total, status')
          .eq('business_id', currentBusiness.id);

        const totalRevenue = (invoices || [])
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + Number(i.total), 0);
        
        const totalOrders = (invoices || []).length;

        // Fetch customer count
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', currentBusiness.id);

        // Fetch inventory count
        const { data: inventory } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('business_id', currentBusiness.id);

        const totalInventory = (inventory || []).reduce((sum, i) => sum + i.quantity, 0);

        setData({
          totalRevenue,
          totalOrders,
          totalCustomers: customerCount || 0,
          totalInventory,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentBusiness]);

  if (businessLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!currentBusiness) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No Business Selected"
        description="Create or select a business from the sidebar to view your dashboard."
      />
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: isLoading ? '...' : formatCompactCurrency(data?.totalRevenue || 0, currentBusiness.currency),
      change: 0,
      changeLabel: 'all time',
      icon: DollarSign,
      trend: 'up' as const,
      accentColor: 'primary' as const,
    },
    {
      title: 'Total Invoices',
      value: isLoading ? '...' : String(data?.totalOrders || 0),
      change: 0,
      changeLabel: 'all time',
      icon: ShoppingCart,
      trend: 'up' as const,
      accentColor: 'info' as const,
    },
    {
      title: 'Active Customers',
      value: isLoading ? '...' : String(data?.totalCustomers || 0),
      change: 0,
      changeLabel: 'all time',
      icon: Users,
      trend: 'up' as const,
      accentColor: 'success' as const,
    },
    {
      title: 'Inventory Items',
      value: isLoading ? '...' : String(data?.totalInventory || 0),
      change: 0,
      changeLabel: 'total units',
      icon: Package,
      trend: 'up' as const,
      accentColor: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RevenueChart />
        <RecentActivity />
      </div>

      {/* Products and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProducts />
        <QuickActions />
      </div>
    </div>
  );
}
