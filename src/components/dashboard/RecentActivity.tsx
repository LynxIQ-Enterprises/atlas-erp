import { FileText, Package, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'invoice',
    title: 'New invoice created',
    description: 'Invoice #INV-2024-001 for $2,450.00',
    time: '2 minutes ago',
    icon: FileText,
    color: 'text-primary bg-primary/10',
  },
  {
    id: 2,
    type: 'order',
    title: 'Order shipped',
    description: 'Order #ORD-5678 shipped to John Smith',
    time: '15 minutes ago',
    icon: Package,
    color: 'text-info bg-info/10',
  },
  {
    id: 3,
    type: 'customer',
    title: 'New customer registered',
    description: 'Sarah Johnson joined as a new customer',
    time: '1 hour ago',
    icon: Users,
    color: 'text-success bg-success/10',
  },
  {
    id: 4,
    type: 'payment',
    title: 'Payment received',
    description: 'Received $1,200.00 for Invoice #INV-2024-089',
    time: '2 hours ago',
    icon: DollarSign,
    color: 'text-success bg-success/10',
  },
  {
    id: 5,
    type: 'alert',
    title: 'Low stock alert',
    description: 'Product "Wireless Mouse" is running low (5 left)',
    time: '3 hours ago',
    icon: AlertTriangle,
    color: 'text-warning bg-warning/10',
  },
];

export function RecentActivity() {
  return (
    <Card variant="gradient">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-4 p-4 hover:bg-accent/30 transition-colors cursor-pointer",
                "animate-slide-in-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                activity.color
              )}>
                <activity.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
