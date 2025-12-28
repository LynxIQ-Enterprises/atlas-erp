import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertTriangle,
  TrendingDown,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, Product } from '@/types/database';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/LoadingState';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/localization';

const statusConfig = {
  'in-stock': { label: 'In Stock', className: 'bg-success/10 text-success border-success/20' },
  'low-stock': { label: 'Low Stock', className: 'bg-warning/10 text-warning border-warning/20' },
  'out-of-stock': { label: 'Out of Stock', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

interface InventoryWithProduct extends InventoryItem {
  product: Product;
}

export default function Inventory() {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    quantity: '',
    reorder_level: '10',
  });

  const fetchInventory = async () => {
    if (!currentBusiness) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(*)
        `)
        .eq('business_id', currentBusiness.id);

      if (fetchError) throw fetchError;
      setItems((data || []) as InventoryWithProduct[]);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [currentBusiness]);

  const handleAddProduct = async () => {
    if (!currentBusiness) return;
    
    setIsAdding(true);
    try {
      // First create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          business_id: currentBusiness.id,
          name: newProduct.name,
          sku: newProduct.sku,
          category: newProduct.category,
          unit_price: parseFloat(newProduct.unit_price),
        })
        .select()
        .single();

      if (productError) throw productError;

      // Then create the inventory entry
      const quantity = parseInt(newProduct.quantity);
      const reorderLevel = parseInt(newProduct.reorder_level);
      let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
      if (quantity === 0) status = 'out-of-stock';
      else if (quantity <= reorderLevel) status = 'low-stock';

      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          business_id: currentBusiness.id,
          product_id: product.id,
          quantity,
          reorder_level: reorderLevel,
          status,
        });

      if (inventoryError) throw inventoryError;

      toast({
        title: 'Product added',
        description: `${newProduct.name} has been added to inventory.`,
      });

      setAddDialogOpen(false);
      setNewProduct({
        name: '',
        sku: '',
        category: '',
        unit_price: '',
        quantity: '',
        reorder_level: '10',
      });
      fetchInventory();
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: 'Error',
        description: 'Failed to add product.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = items.filter((item) => item.status === 'low-stock').length;
  const outOfStockCount = items.filter((item) => item.status === 'out-of-stock').length;

  if (!currentBusiness) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No Business Selected"
        description="Select a business to view inventory."
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchInventory} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your products and stock levels • {currentBusiness.name}
          </p>
        </div>
        <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
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
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : totalItems}
              </p>
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
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : lowStockCount}
              </p>
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
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : outOfStockCount}
              </p>
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
      {isLoading ? (
        <LoadingState message="Loading inventory..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No Products Found"
          description={items.length === 0 
            ? "Add your first product to get started." 
            : "No products match your search."}
          action={items.length === 0 && (
            <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        />
      ) : (
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
                  const stockPercentage = Math.min(100, (item.quantity / (item.reorder_level * 3)) * 100);
                  return (
                    <TableRow
                      key={item.id}
                      className="border-border hover:bg-accent/30 cursor-pointer animate-slide-in-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-medium text-foreground">
                        {item.product?.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {item.product?.sku}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.product?.category || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={stockPercentage} className="h-2 w-20" />
                          <span className="text-sm text-foreground">{item.quantity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {formatCurrency(item.product?.unit_price || 0, currentBusiness.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(statusConfig[item.status]?.className)}
                        >
                          {statusConfig[item.status]?.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unit Price ({currentBusiness.currency})</Label>
              <Input
                type="number"
                step="0.01"
                value={newProduct.unit_price}
                onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial Quantity</Label>
                <Input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={newProduct.reorder_level}
                  onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="gradient-gold" 
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.sku || !newProduct.unit_price || !newProduct.quantity || isAdding}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isAdding ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
