import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const products = [
  { name: 'MacBook Pro 16"', sales: 245, revenue: 489510, progress: 100 },
  { name: 'iPhone 15 Pro Max', sales: 189, revenue: 226800, progress: 77 },
  { name: 'AirPods Pro', sales: 156, revenue: 38844, progress: 64 },
  { name: 'iPad Pro 12.9"', sales: 98, revenue: 107702, progress: 40 },
  { name: 'Apple Watch Ultra', sales: 76, revenue: 60724, progress: 31 },
];

export function TopProducts() {
  return (
    <Card variant="gradient">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {products.map((product, index) => (
          <div
            key={product.name}
            className="space-y-2 animate-slide-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{product.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${product.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{product.sales} sales</p>
              </div>
            </div>
            <Progress value={product.progress} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
