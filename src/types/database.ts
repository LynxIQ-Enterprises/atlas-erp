// Database types matching Supabase schema

export interface Business {
  id: string;
  name: string;
  type: 'physical' | 'digital' | 'hybrid';
  address: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AdminBusinessAccess {
  id: string;
  admin_user_id: string;
  business_id: string;
  granted_at: string;
}

export interface Employee {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  department: string;
  status: 'active' | 'on-leave' | 'inactive';
  hire_date: string | null;
  salary: number | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  status: 'active' | 'inactive' | 'vip';
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string | null;
  unit_price: number;
  cost_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  business_id: string;
  product_id: string;
  quantity: number;
  reorder_level: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  updated_at: string;
  product?: Product;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string | null;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Payment {
  id: string;
  business_id: string;
  invoice_id: string | null;
  amount: number;
  payment_method: 'cash' | 'card' | 'eft' | 'other';
  payment_date: string;
  reference: string | null;
  created_at: string;
}

// Dashboard stats type
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  totalInventory: number;
  inventoryChange: number;
}
