import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, Globe, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBusiness } from '@/contexts/BusinessContext';

export function BusinessSwitcher() {
  const [open, setOpen] = useState(false);
  const { businesses, currentBusiness, setCurrentBusiness } = useBusiness();

  return (
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
              {currentBusiness?.type === 'digital' ? (
                <Globe className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Building2 className="h-4 w-4 text-primary-foreground" />
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                {currentBusiness?.name || 'Select Business'}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {currentBusiness?.type || 'No business'}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 bg-popover border-border" align="start">
        <div className="space-y-1">
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => {
                setCurrentBusiness(business);
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
                {business.type === 'digital' ? (
                  <Globe className={cn(
                    "h-4 w-4",
                    currentBusiness?.id === business.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )} />
                ) : (
                  <Building2 className={cn(
                    "h-4 w-4",
                    currentBusiness?.id === business.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )} />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{business.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{business.type}</p>
              </div>
              {currentBusiness?.id === business.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
              onClick={() => setOpen(false)}
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
  );
}
