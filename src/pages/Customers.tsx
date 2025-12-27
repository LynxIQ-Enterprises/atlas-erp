import { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  Building,
  User,
  DollarSign,
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
import { cn } from '@/lib/utils';

const customers = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 555 123 4567',
    type: 'business',
    totalSpent: 125450,
    ordersCount: 45,
    lastOrder: '2024-01-15',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 555 234 5678',
    type: 'individual',
    totalSpent: 2340,
    ordersCount: 8,
    lastOrder: '2024-01-18',
  },
  {
    id: '3',
    name: 'Tech Innovators LLC',
    email: 'info@techinnovators.com',
    phone: '+1 555 345 6789',
    type: 'business',
    totalSpent: 89750,
    ordersCount: 32,
    lastOrder: '2024-01-12',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1 555 456 7890',
    type: 'individual',
    totalSpent: 5670,
    ordersCount: 15,
    lastOrder: '2024-01-20',
  },
  {
    id: '5',
    name: 'Global Solutions Inc',
    email: 'contact@globalsolutions.com',
    phone: '+1 555 567 8901',
    type: 'business',
    totalSpent: 234500,
    ordersCount: 78,
    lastOrder: '2024-01-19',
  },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const businessCount = customers.filter((c) => c.type === 'business').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Button className="gradient-gold">
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
              <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
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
              <p className="text-2xl font-bold text-foreground">{businessCount}</p>
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
              <p className="text-2xl font-bold text-foreground">${(totalRevenue / 1000).toFixed(0)}k</p>
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
      <Card variant="gradient">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Contact</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Total Spent</TableHead>
                <TableHead className="text-muted-foreground">Orders</TableHead>
                <TableHead className="text-muted-foreground">Last Order</TableHead>
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
                        {customer.type === 'business' ? (
                          <Building className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <User className="h-5 w-5 text-primary-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        customer.type === 'business'
                          ? 'bg-info/10 text-info border-info/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      )}
                    >
                      {customer.type === 'business' ? 'Business' : 'Individual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    ${customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.ordersCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
