import {
  Plus,
  FileText,
  Users,
  Package,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'New Invoice',
    icon: FileText,
    description: 'Create a new invoice',
    gradient: 'from-primary/20 to-warning/10',
    iconBg: 'bg-primary/10 text-primary',
  },
  {
    label: 'Add Customer',
    icon: Users,
    description: 'Register new customer',
    gradient: 'from-success/20 to-info/10',
    iconBg: 'bg-success/10 text-success',
  },
  {
    label: 'Add Product',
    icon: Package,
    description: 'Add inventory item',
    gradient: 'from-info/20 to-primary/10',
    iconBg: 'bg-info/10 text-info',
  },
  {
    label: 'AI Assistant',
    icon: Sparkles,
    description: 'Get AI help',
    gradient: 'from-warning/20 to-destructive/10',
    iconBg: 'bg-warning/10 text-warning',
  },
];

export function QuickActions() {
  return (
    <Card variant="gradient">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            className={cn(
              "group relative flex flex-col items-start gap-3 rounded-xl p-4 text-left transition-all duration-200",
              "bg-gradient-to-br hover:scale-[1.02] hover:shadow-glow",
              "border border-border/50 hover:border-primary/30",
              action.gradient,
              "animate-scale-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
              action.iconBg
            )}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
