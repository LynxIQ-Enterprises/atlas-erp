-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');

-- Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('physical', 'digital', 'hybrid')),
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin users table (links to auth.users)
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- User roles table (for RLS security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Admin business access junction table
CREATE TABLE public.admin_business_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(admin_user_id, business_id)
);

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on-leave', 'inactive')),
  hire_date DATE,
  salary DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
  total_spent DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'eft', 'other')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function to check if user has business access
CREATE OR REPLACE FUNCTION public.has_business_access(_user_id UUID, _business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_business_access aba
    JOIN public.admin_users au ON au.id = aba.admin_user_id
    WHERE au.user_id = _user_id AND aba.business_id = _business_id
  )
$$;

-- RLS Policies for businesses
CREATE POLICY "Users can view businesses they have access to"
ON public.businesses FOR SELECT TO authenticated
USING (public.has_business_access(auth.uid(), id));

CREATE POLICY "Users can update businesses they have access to"
ON public.businesses FOR UPDATE TO authenticated
USING (public.has_business_access(auth.uid(), id));

-- RLS Policies for admin_users
CREATE POLICY "Users can view their own admin profile"
ON public.admin_users FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own admin profile"
ON public.admin_users FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for admin_business_access
CREATE POLICY "Users can view their own business access"
ON public.admin_business_access FOR SELECT TO authenticated
USING (
  admin_user_id IN (
    SELECT id FROM public.admin_users WHERE user_id = auth.uid()
  )
);

-- RLS Policies for employees (business-scoped)
CREATE POLICY "Users can view employees of their businesses"
ON public.employees FOR SELECT TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can insert employees to their businesses"
ON public.employees FOR INSERT TO authenticated
WITH CHECK (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can update employees of their businesses"
ON public.employees FOR UPDATE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can delete employees of their businesses"
ON public.employees FOR DELETE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

-- RLS Policies for customers (business-scoped)
CREATE POLICY "Users can view customers of their businesses"
ON public.customers FOR SELECT TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can insert customers to their businesses"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can update customers of their businesses"
ON public.customers FOR UPDATE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can delete customers of their businesses"
ON public.customers FOR DELETE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

-- RLS Policies for products (business-scoped)
CREATE POLICY "Users can view products of their businesses"
ON public.products FOR SELECT TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can insert products to their businesses"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can update products of their businesses"
ON public.products FOR UPDATE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can delete products of their businesses"
ON public.products FOR DELETE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

-- RLS Policies for inventory (business-scoped)
CREATE POLICY "Users can view inventory of their businesses"
ON public.inventory FOR SELECT TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can insert inventory to their businesses"
ON public.inventory FOR INSERT TO authenticated
WITH CHECK (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can update inventory of their businesses"
ON public.inventory FOR UPDATE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can delete inventory of their businesses"
ON public.inventory FOR DELETE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

-- RLS Policies for invoices (business-scoped)
CREATE POLICY "Users can view invoices of their businesses"
ON public.invoices FOR SELECT TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can insert invoices to their businesses"
ON public.invoices FOR INSERT TO authenticated
WITH CHECK (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can update invoices of their businesses"
ON public.invoices FOR UPDATE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can delete invoices of their businesses"
ON public.invoices FOR DELETE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

-- RLS Policies for invoice_items (via invoice access)
CREATE POLICY "Users can view invoice items of their invoices"
ON public.invoice_items FOR SELECT TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE public.has_business_access(auth.uid(), business_id)
  )
);

CREATE POLICY "Users can insert invoice items to their invoices"
ON public.invoice_items FOR INSERT TO authenticated
WITH CHECK (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE public.has_business_access(auth.uid(), business_id)
  )
);

CREATE POLICY "Users can update invoice items of their invoices"
ON public.invoice_items FOR UPDATE TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE public.has_business_access(auth.uid(), business_id)
  )
);

CREATE POLICY "Users can delete invoice items of their invoices"
ON public.invoice_items FOR DELETE TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices WHERE public.has_business_access(auth.uid(), business_id)
  )
);

-- RLS Policies for payments (business-scoped)
CREATE POLICY "Users can view payments of their businesses"
ON public.payments FOR SELECT TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can insert payments to their businesses"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can update payments of their businesses"
ON public.payments FOR UPDATE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

CREATE POLICY "Users can delete payments of their businesses"
ON public.payments FOR DELETE TO authenticated
USING (public.has_business_access(auth.uid(), business_id));

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create admin user on signup
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_users (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- Create indexes for performance
CREATE INDEX idx_employees_business_id ON public.employees(business_id);
CREATE INDEX idx_customers_business_id ON public.customers(business_id);
CREATE INDEX idx_products_business_id ON public.products(business_id);
CREATE INDEX idx_inventory_business_id ON public.inventory(business_id);
CREATE INDEX idx_invoices_business_id ON public.invoices(business_id);
CREATE INDEX idx_payments_business_id ON public.payments(business_id);
CREATE INDEX idx_admin_business_access_admin_user_id ON public.admin_business_access(admin_user_id);
CREATE INDEX idx_admin_business_access_business_id ON public.admin_business_access(business_id);