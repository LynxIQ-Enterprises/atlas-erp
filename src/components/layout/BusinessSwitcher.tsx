import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, Globe, Plus, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusiness } from '@/contexts/BusinessContext';
import { LoadingState } from '@/components/ui/LoadingState';

export function BusinessSwitcher() {
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState<'physical' | 'digital' | 'hybrid'>('digital');
  const [newBusinessAddress, setNewBusinessAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const { businesses, currentBusiness, isLoading, switchBusiness, addBusiness } = useBusiness();

  const handleAddBusiness = async () => {
    if (!newBusinessName.trim()) return;
    
    setIsAdding(true);
    const result = await addBusiness({
      name: newBusinessName.trim(),
      type: newBusinessType,
      address: newBusinessAddress.trim() || null,
      currency: 'ZAR',
    });
    
    if (result) {
      setAddDialogOpen(false);
      setNewBusinessName('');
      setNewBusinessType('digital');
      setNewBusinessAddress('');
    }
    setIsAdding(false);
  };

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'digital':
        return <Globe className="h-4 w-4" />;
      case 'physical':
        return <Building2 className="h-4 w-4" />;
      case 'hybrid':
        return <Layers className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 py-4">
        <LoadingState message="Loading businesses..." className="py-4" />
      </div>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 py-6 hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-gold">
                {currentBusiness ? (
                  <span className="text-primary-foreground">
                    {getBusinessIcon(currentBusiness.type)}
                  </span>
                ) : (
                  <Building2 className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                  {currentBusiness?.name || 'No Business'}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {currentBusiness?.type || 'Select a business'}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 bg-popover border-border" align="start">
          <div className="space-y-1">
            {businesses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No businesses yet. Create your first one!
              </p>
            ) : (
              businesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => {
                    switchBusiness(business.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    currentBusiness?.id === business.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    currentBusiness?.id === business.id
                      ? "gradient-gold"
                      : "bg-muted"
                  )}>
                    <span className={cn(
                      currentBusiness?.id === business.id
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    )}>
                      {getBusinessIcon(business.type)}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{business.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{business.type} • {business.currency}</p>
                  </div>
                  {currentBusiness?.id === business.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
            <div className="border-t border-border mt-2 pt-2">
              <button
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                onClick={() => {
                  setOpen(false);
                  setAddDialogOpen(true);
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-muted-foreground/50">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Add Business</span>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Add Business Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add New Business</DialogTitle>
            <DialogDescription>
              Create a new business to manage. You can switch between businesses anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="My Business"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={newBusinessType} onValueChange={(v) => setNewBusinessType(v as any)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital (Online)</SelectItem>
                  <SelectItem value="physical">Physical (Retail/Office)</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Address (Optional)</Label>
              <Input
                id="businessAddress"
                placeholder="123 Main Street, Johannesburg"
                value={newBusinessAddress}
                onChange={(e) => setNewBusinessAddress(e.target.value)}
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
              onClick={handleAddBusiness}
              disabled={!newBusinessName.trim() || isAdding}
            >
              {isAdding ? 'Creating...' : 'Create Business'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
