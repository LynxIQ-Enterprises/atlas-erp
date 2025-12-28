import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  Building,
  User,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/database';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/LoadingState';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDisplayDate } from '@/lib/localization';

export default function Customers() {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'vip',
  });

  const fetchCustomers = async () => {
    if (!currentBusiness) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('name');

      if (fetchError) throw fetchError;
      setCustomers((data || []) as Customer[]);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentBusiness]);

  const handleAddCustomer = async () => {
    if (!currentBusiness) return;
    
    setIsAdding(true);
    try {
      const { error: insertError } = await supabase
        .from('customers')
        .insert({
          ...newCustomer,
          business_id: currentBusiness.id,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Customer added',
        description: `${newCustomer.name} has been added.`,
      });

      setAddDialogOpen(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        status: 'active',
      });
      fetchCustomers();
    } catch (err) {
      console.error('Error adding customer:', err);
      toast({
        title: 'Error',
        description: 'Failed to add customer.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const businessCount = customers.filter((c) => c.company).length;
  const totalRevenue = customers.reduce((sum, c) => sum + Number(c.total_spent), 0);

  if (!currentBusiness) {
    return (
      <EmptyState
        icon={<User className="h-12 w-12" />}
        title="No Business Selected"
        description="Select a business to view customers."
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchCustomers} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships • {currentBusiness.name}
          </p>
        </div>
        <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : totalCustomers}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
              <Building className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Business Accounts</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : businessCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : formatCurrency(totalRevenue, currentBusiness.currency)}
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
                placeholder="Search customers..."
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
        <LoadingState message="Loading customers..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<User className="h-12 w-12" />}
          title="No Customers Found"
          description={customers.length === 0 
            ? "Add your first customer to get started." 
            : "No customers match your search."}
          action={customers.length === 0 && (
            <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}
        />
      ) : (
        <Card variant="gradient">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Total Spent</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow
                    key={customer.id}
                    className="border-border hover:bg-accent/30 cursor-pointer animate-slide-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center">
                          {customer.company ? (
                            <Building className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <User className="h-5 w-5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{customer.name}</span>
                          {customer.company && (
                            <p className="text-xs text-muted-foreground">{customer.company}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          customer.company
                            ? 'bg-info/10 text-info border-info/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        )}
                      >
                        {customer.company ? 'Business' : 'Individual'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(Number(customer.total_spent), currentBusiness.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          customer.status === 'active' && 'bg-success/10 text-success border-success/20',
                          customer.status === 'vip' && 'bg-primary/10 text-primary border-primary/20',
                          customer.status === 'inactive' && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {customer.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Customer Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to {currentBusiness.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Input
                value={newCustomer.company}
                onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={newCustomer.status} 
                onValueChange={(v) => setNewCustomer({ ...newCustomer, status: v as any })}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="gradient-gold" 
              onClick={handleAddCustomer}
              disabled={!newCustomer.name || isAdding}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isAdding ? 'Adding...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
