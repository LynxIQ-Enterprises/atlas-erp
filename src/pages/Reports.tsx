import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState, EmptyState } from '@/components/ui/LoadingState';
import { formatCurrency } from '@/lib/localization';

const COLORS = ['hsl(45, 93%, 58%)', 'hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)'];

const reportCards = [
  {
    title: 'Sales Report',
    description: 'Monthly sales performance analysis',
    icon: BarChart3,
    gradient: 'from-primary/20 to-warning/10',
  },
  {
    title: 'Inventory Report',
    description: 'Stock levels and turnover rates',
    icon: PieChart,
    gradient: 'from-info/20 to-primary/10',
  },
  {
    title: 'Customer Report',
    description: 'Customer acquisition and retention',
    icon: TrendingUp,
    gradient: 'from-success/20 to-info/10',
  },
  {
    title: 'Financial Report',
    description: 'Revenue, expenses, and profit margins',
    icon: Calendar,
    gradient: 'from-warning/20 to-destructive/10',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 shadow-elevated">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const { currentBusiness } = useBusiness();
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!currentBusiness) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch invoices for sales data
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total, status, created_at')
          .eq('business_id', currentBusiness.id)
          .eq('status', 'paid');

        // Group by month
        const monthlyData: Record<string, number> = {};
        (invoices || []).forEach((inv) => {
          const date = new Date(inv.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          monthlyData[month] = (monthlyData[month] || 0) + Number(inv.total);
        });

        const salesChartData = Object.entries(monthlyData).map(([month, sales]) => ({
          month,
          sales,
        }));
        setSalesData(salesChartData);

        // Fetch products for category data
        const { data: products } = await supabase
          .from('products')
          .select('category')
          .eq('business_id', currentBusiness.id);

        const categoryCount: Record<string, number> = {};
        (products || []).forEach((p) => {
          const cat = p.category || 'Other';
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        const total = Object.values(categoryCount).reduce((a, b) => a + b, 0);
        const catData = Object.entries(categoryCount).map(([name, count]) => ({
          name,
          value: total > 0 ? Math.round((count / total) * 100) : 0,
        }));
        setCategoryData(catData);
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [currentBusiness]);

  if (!currentBusiness) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-12 w-12" />}
        title="No Business Selected"
        description="Select a business to view reports."
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and business insights • {currentBusiness.name}
          </p>
        </div>
        <Button className="gradient-gold">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportCards.map((report, index) => (
          <Card
            key={report.title}
            variant="interactive"
            className={`bg-gradient-to-br ${report.gradient} animate-scale-in`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50">
                  <report.icon className="h-5 w-5 text-foreground" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-foreground">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <LoadingState message="Loading reports..." />
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Sales Bar Chart */}
            <Card variant="gradient">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" vertical={false} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="sales"
                          fill="hsl(45, 93%, 58%)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No sales data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Pie Chart */}
            <Card variant="gradient">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Products by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-muted-foreground">No product data yet</div>
                  )}
                </div>
                {categoryData.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                        <span className="text-sm font-medium text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
