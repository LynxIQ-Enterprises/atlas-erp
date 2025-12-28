import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  FileText,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
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
import { Invoice, Customer } from '@/types/database';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/LoadingState';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDisplayDate } from '@/lib/localization';

interface InvoiceWithCustomer extends Invoice {
  customer?: Customer;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: FileText,
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
  sent: {
    label: 'Sent',
    icon: Send,
    className: 'bg-info/10 text-info border-info/20',
  },
  paid: {
    label: 'Paid',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
};

export default function Invoices() {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    customer_id: '',
    total: '',
    due_date: '',
    notes: '',
  });

  const fetchData = async () => {
    if (!currentBusiness) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [invoicesRes, customersRes] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            *,
            customer:customers(*)
          `)
          .eq('business_id', currentBusiness.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .order('name'),
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (customersRes.error) throw customersRes.error;

      setInvoices((invoicesRes.data || []) as InvoiceWithCustomer[]);
      setCustomers((customersRes.data || []) as Customer[]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentBusiness]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${random}`;
  };

  const handleAddInvoice = async () => {
    if (!currentBusiness) return;
    
    setIsAdding(true);
    try {
      const total = parseFloat(newInvoice.total);
      
      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          business_id: currentBusiness.id,
          customer_id: newInvoice.customer_id || null,
          invoice_number: generateInvoiceNumber(),
          total,
          subtotal: total,
          tax_amount: 0,
          due_date: newInvoice.due_date,
          notes: newInvoice.notes || null,
          status: 'draft',
        });

      if (insertError) throw insertError;

      toast({
        title: 'Invoice created',
        description: 'The invoice has been created as a draft.',
      });

      setAddDialogOpen(false);
      setNewInvoice({
        customer_id: '',
        total: '',
        due_date: '',
        notes: '',
      });
      fetchData();
    } catch (err) {
      console.error('Error adding invoice:', err);
      toast({
        title: 'Error',
        description: 'Failed to create invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Invoice['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Status updated',
        description: `Invoice marked as ${status}.`,
      });
      fetchData();
    } catch (err) {
      console.error('Error updating invoice:', err);
      toast({
        title: 'Error',
        description: 'Failed to update invoice.',
        variant: 'destructive',
      });
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0);
  const totalPending = invoices.filter((i) => i.status === 'sent').reduce((sum, i) => sum + Number(i.total), 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + Number(i.total), 0);

  if (!currentBusiness) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No Business Selected"
        description="Select a business to view invoices."
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage invoices • {currentBusiness.name}
          </p>
        </div>
        <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : formatCurrency(totalPaid, currentBusiness.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : formatCurrency(totalPending, currentBusiness.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : formatCurrency(totalOverdue, currentBusiness.currency)}
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
                placeholder="Search invoices..."
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
        <LoadingState message="Loading invoices..." />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No Invoices Found"
          description={invoices.length === 0 
            ? "Create your first invoice to get started." 
            : "No invoices match your search."}
          action={invoices.length === 0 && (
            <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          )}
        />
      ) : (
        <Card variant="gradient">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Invoice</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice, index) => {
                  const status = statusConfig[invoice.status];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow
                      key={invoice.id}
                      className="border-border hover:bg-accent/30 cursor-pointer animate-slide-in-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-mono font-medium text-foreground">
                            {invoice.invoice_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {invoice.customer?.name || 'No customer'}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(Number(invoice.total), currentBusiness.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('gap-1.5', status.className)}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDisplayDate(invoice.due_date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {invoice.status === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleUpdateStatus(invoice.id, 'sent')}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for {currentBusiness.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select 
                value={newInvoice.customer_id} 
                onValueChange={(v) => setNewInvoice({ ...newInvoice, customer_id: v })}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Amount ({currentBusiness.currency})</Label>
              <Input
                type="number"
                step="0.01"
                value={newInvoice.total}
                onChange={(e) => setNewInvoice({ ...newInvoice, total: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newInvoice.due_date}
                onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="gradient-gold" 
              onClick={handleAddInvoice}
              disabled={!newInvoice.total || !newInvoice.due_date || isAdding}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isAdding ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
