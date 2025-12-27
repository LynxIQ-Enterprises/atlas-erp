import { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const inventoryItems = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    sku: 'MBP-16-2024',
    category: 'Electronics',
    quantity: 45,
    unitPrice: 2499,
    reorderLevel: 20,
    status: 'in_stock',
  },
  {
    id: '2',
    name: 'iPhone 15 Pro Max',
    sku: 'IPH-15PM-256',
    category: 'Electronics',
    quantity: 12,
    unitPrice: 1199,
    reorderLevel: 15,
    status: 'low_stock',
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    sku: 'APP-2-2024',
    category: 'Accessories',
    quantity: 89,
    unitPrice: 249,
    reorderLevel: 30,
    status: 'in_stock',
  },
  {
    id: '4',
    name: 'iPad Pro 12.9"',
    sku: 'IPD-129-256',
    category: 'Electronics',
    quantity: 0,
    unitPrice: 1099,
    reorderLevel: 10,
    status: 'out_of_stock',
  },
  {
    id: '5',
    name: 'Magic Keyboard',
    sku: 'MK-USB-C',
    category: 'Accessories',
    quantity: 67,
    unitPrice: 99,
    reorderLevel: 25,
    status: 'in_stock',
  },
];

const statusConfig = {
  in_stock: { label: 'In Stock', className: 'bg-success/10 text-success border-success/20' },
  low_stock: { label: 'Low Stock', className: 'bg-warning/10 text-warning border-warning/20' },
  out_of_stock: { label: 'Out of Stock', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = inventoryItems.filter((item) => item.status === 'low_stock').length;
  const outOfStockCount = inventoryItems.filter((item) => item.status === 'out_of_stock').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage your products and stock levels</p>
        </div>
        <Button className="gradient-gold">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-foreground">{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-foreground">{outOfStockCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="gradient">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-border"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card variant="gradient">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">SKU</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Stock Level</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => {
                const stockPercentage = Math.min(100, (item.quantity / (item.reorderLevel * 3)) * 100);
                return (
                  <TableRow
                    key={item.id}
                    className="border-border hover:bg-accent/30 cursor-pointer animate-slide-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={stockPercentage} className="h-2 w-20" />
                        <span className="text-sm text-foreground">{item.quantity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      ${item.unitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(statusConfig[item.status as keyof typeof statusConfig].className)}
                      >
                        {statusConfig[item.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
