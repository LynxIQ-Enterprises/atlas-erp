import { useState } from 'react';
import {
  Building2,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const settingsSections = [
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Database },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('business');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <Card variant="gradient" className="lg:col-span-1 h-fit">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'business' && (
            <>
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Update your business details and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input id="businessName" defaultValue="Tech Solutions Inc." className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input id="businessType" defaultValue="Digital Services" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input id="email" type="email" defaultValue="contact@techsolutions.com" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="+1 555 123 4567" className="bg-muted/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Business Avenue, Suite 100" className="bg-muted/50" />
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-end">
                    <Button className="gradient-gold">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>Regional Settings</CardTitle>
                  <CardDescription>Configure currency and timezone preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input id="currency" defaultValue="USD ($)" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" defaultValue="America/New_York (EST)" className="bg-muted/50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'security' && (
            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="space-y-4">
                  <Label>Change Password</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input type="password" placeholder="Current password" className="bg-muted/50" />
                    <Input type="password" placeholder="New password" className="bg-muted/50" />
                  </div>
                  <Button variant="secondary">Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Email Notifications', desc: 'Receive updates via email' },
                  { label: 'Order Alerts', desc: 'Get notified about new orders' },
                  { label: 'Low Stock Alerts', desc: 'Alerts when inventory is low' },
                  { label: 'Payment Notifications', desc: 'Receive payment confirmations' },
                  { label: 'Weekly Reports', desc: 'Get weekly business summaries' },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={index < 3} />
                    </div>
                    {index < 4 && <Separator className="bg-border mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 'integrations' && (
            <Card variant="gradient">
              <CardHeader>
                <CardTitle>API & Integrations</CardTitle>
                <CardDescription>Connect external services and manage API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">API Key</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                      readOnly
                      className="bg-muted/50 font-mono text-sm"
                    />
                    <Button variant="outline">Copy</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Available Integrations</h4>
                  {[
                    { name: 'OpenAI', status: 'Configure API key to enable AI features', connected: false },
                    { name: 'Stripe', status: 'Payment processing', connected: false },
                    { name: 'Supabase', status: 'Connect for backend services', connected: false },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.status}</p>
                        </div>
                      </div>
                      <Button variant={integration.connected ? 'secondary' : 'outline'} size="sm">
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(activeSection === 'account' || activeSection === 'appearance') && (
            <Card variant="gradient">
              <CardHeader>
                <CardTitle className="capitalize">{activeSection} Settings</CardTitle>
                <CardDescription>Configure your {activeSection} preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {activeSection === 'account'
                    ? 'Manage your personal account information and preferences.'
                    : 'Customize the look and feel of your dashboard.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
