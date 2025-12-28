import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Users as UsersIcon,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Employee } from '@/types/database';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/LoadingState';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/localization';

const departmentColors: Record<string, string> = {
  Engineering: 'bg-info/10 text-info border-info/20',
  Product: 'bg-primary/10 text-primary border-primary/20',
  Sales: 'bg-success/10 text-success border-success/20',
  'Human Resources': 'bg-warning/10 text-warning border-warning/20',
  Marketing: 'bg-destructive/10 text-destructive border-destructive/20',
  Operations: 'bg-accent/50 text-accent-foreground border-accent/20',
  Finance: 'bg-primary/10 text-primary border-primary/20',
};

const statusColors: Record<string, string> = {
  active: 'bg-success',
  'on-leave': 'bg-warning',
  inactive: 'bg-muted-foreground',
};

export default function Employees() {
  const { currentBusiness } = useBusiness();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active' as 'active' | 'on-leave' | 'inactive',
  });

  const fetchEmployees = async () => {
    if (!currentBusiness) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('first_name');

      if (fetchError) throw fetchError;
      setEmployees((data || []) as Employee[]);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentBusiness]);

  const handleAddEmployee = async () => {
    if (!currentBusiness) return;
    
    setIsAdding(true);
    try {
      const { error: insertError } = await supabase
        .from('employees')
        .insert({
          ...newEmployee,
          business_id: currentBusiness.id,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Employee added',
        description: `${newEmployee.first_name} ${newEmployee.last_name} has been added.`,
      });

      setAddDialogOpen(false);
      setNewEmployee({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        status: 'active',
      });
      fetchEmployees();
    } catch (err) {
      console.error('Error adding employee:', err);
      toast({
        title: 'Error',
        description: 'Failed to add employee.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Employee removed',
        description: 'The employee has been removed.',
      });
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove employee.',
        variant: 'destructive',
      });
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentBusiness) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-12 w-12" />}
        title="No Business Selected"
        description="Select a business to view employees."
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchEmployees} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground">
            Manage your team members • {currentBusiness.name}
          </p>
        </div>
        <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card variant="gradient">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
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

      {/* Employee Grid */}
      {isLoading ? (
        <LoadingState message="Loading employees..." />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-12 w-12" />}
          title="No Employees Found"
          description={employees.length === 0 
            ? "Add your first employee to get started." 
            : "No employees match your search."}
          action={employees.length === 0 && (
            <Button className="gradient-gold" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee, index) => (
            <Card
              key={employee.id}
              variant="interactive"
              className="animate-slide-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">
                          {employee.first_name[0]}
                          {employee.last_name[0]}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card",
                          statusColors[employee.status]
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {employee.first_name} {employee.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Badge
                  variant="outline"
                  className={cn('mb-4', departmentColors[employee.department] || 'bg-muted text-muted-foreground')}
                >
                  {employee.department}
                </Badge>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new team member to {currentBusiness.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={newEmployee.first_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={newEmployee.last_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                placeholder="e.g., Senior Developer"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select 
                value={newEmployee.department} 
                onValueChange={(v) => setNewEmployee({ ...newEmployee, department: v })}
              >
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
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
              onClick={handleAddEmployee}
              disabled={!newEmployee.first_name || !newEmployee.last_name || !newEmployee.email || !newEmployee.role || !newEmployee.department || isAdding}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isAdding ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
