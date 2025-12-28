import { useState } from 'react';
import { Search, Bell, Calendar, MessageSquare, Command, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDisplayDate } from '@/lib/localization';

export function Header() {
  const { currentBusiness } = useBusiness();
  const { signOut, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section - Page Title */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentBusiness 
                ? `${currentBusiness.name} • ${currentBusiness.currency}`
                : 'Select a business to get started'}
            </p>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-64 pl-9 pr-12 bg-muted/50 border-border focus:bg-background"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5">
              <Command className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">K</span>
            </div>
          </div>

          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Quick Actions */}
          <Button variant="ghost" size="icon" className="relative">
            <Calendar className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-0 bg-popover border-border"
              align="end"
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-primary">
                    Mark all read
                  </Button>
                </div>
              </div>
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Display */}
          <div className="hidden lg:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDisplayDate(new Date())}
            </span>
          </div>

          {/* Sign Out */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={signOut}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
