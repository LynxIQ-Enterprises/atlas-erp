import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  accentColor?: 'primary' | 'success' | 'warning' | 'info';
}

const accentStyles = {
  primary: 'from-primary/20 to-transparent',
  success: 'from-success/20 to-transparent',
  warning: 'from-warning/20 to-transparent',
  info: 'from-info/20 to-transparent',
};

const iconBgStyles = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  accentColor = 'primary',
}: StatCardProps) {
  return (
    <Card variant="stat" className="group hover:shadow-glow transition-all duration-300">
      {/* Accent gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100",
        accentStyles[accentColor]
      )} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
            iconBgStyles[accentColor]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </Card>
  );
}
