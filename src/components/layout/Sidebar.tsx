import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  UserCircle,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BusinessSwitcher } from './BusinessSwitcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: UserCircle, label: 'Customers', path: '/customers' },
  { icon: FileText, label: 'Invoices', path: '/invoices' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

const secondaryNavItems = [
  { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const NavItem = ({ icon: Icon, label, path }: { icon: any; label: string; path: string }) => {
    const isActive = location.pathname === path;

    const content = (
      <NavLink
        to={path}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 shrink-0",
          isActive && "text-primary"
        )} />
        {!collapsed && (
          <span className="text-sm font-medium">{label}</span>
        )}
        {isActive && !collapsed && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-popover border-border">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Business Switcher */}
      <div className={cn(
        "p-3",
        collapsed && "flex justify-center"
      )}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold cursor-pointer">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-border">
              Switch Business
            </TooltipContent>
          </Tooltip>
        ) : (
          <BusinessSwitcher />
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className={cn(
          "mb-4",
          collapsed ? "hidden" : "block"
        )}>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3">
            Main Menu
          </span>
        </div>
        {mainNavItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        <div className={cn(
          "pt-6 mb-4",
          collapsed ? "hidden" : "block"
        )}>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3">
            Other
          </span>
        </div>
        {secondaryNavItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center text-muted-foreground hover:text-foreground",
            !collapsed && "justify-start px-3"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2 text-sm">Collapse</span>
            </>
          )}
        </Button>

        {/* User Section */}
        <div className={cn(
          "mt-3 flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50 cursor-pointer transition-colors",
          collapsed && "justify-center p-2"
        )}>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-warning flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-sidebar" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@erp.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
