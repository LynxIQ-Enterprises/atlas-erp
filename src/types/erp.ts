export interface Business {
  id: string;
  name: string;
  type: 'physical' | 'digital';
  logo?: string;
  address?: string;
  currency: string;
  createdAt: Date;
}

export interface Employee {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive' | 'terminated';
  avatar?: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  type: 'individual' | 'business';
  totalSpent: number;
  lastOrderDate?: Date;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  reorderLevel: number;
  supplier?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Invoice {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

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
