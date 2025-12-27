import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useBusiness } from '@/contexts/BusinessContext';

export default function Dashboard() {
  const { currentBusiness } = useBusiness();

  const stats = [
    {
      title: 'Total Revenue',
      value: '$284,592',
      change: 12.5,
      changeLabel: 'vs last month',
      icon: DollarSign,
      trend: 'up' as const,
      accentColor: 'primary' as const,
    },
    {
      title: 'Total Orders',
      value: '1,429',
      change: 8.2,
      changeLabel: 'vs last month',
      icon: ShoppingCart,
      trend: 'up' as const,
      accentColor: 'info' as const,
    },
    {
      title: 'Active Customers',
      value: '892',
      change: 5.1,
      changeLabel: 'vs last month',
      icon: Users,
      trend: 'up' as const,
      accentColor: 'success' as const,
    },
    {
      title: 'Inventory Items',
      value: '2,847',
      change: -2.4,
      changeLabel: 'vs last month',
      icon: Package,
      trend: 'down' as const,
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
