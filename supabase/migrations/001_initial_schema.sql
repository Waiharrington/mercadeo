-- ============================================================
-- MERCADEO SaaS - Initial Database Schema
-- ============================================================

-- Create custom schema
CREATE SCHEMA IF NOT EXISTS mercadeo;
SET search_path TO mercadeo, public;

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
create table mercadeo.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  country text default 'VE',
  id_number text,

  business_name text not null,
  business_slug text unique not null,
  business_size text,
  business_type text not null default 'personal' check (business_type in ('personal', 'business')),

  legal_type text,
  rif_number text,
  rif_image_url text,
  category_niche text,
  description text,

  logo_url text,
  banner_url text,
  primary_color text default '#10B981',
  phone_whatsapp text,
  social_links jsonb default '{}',

  subscription_plan text default 'free_trial',
  subscription_status text default 'trialing' check (subscription_status in ('trialing', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  stripe_customer_id text,
  stripe_subscription_id text,

  monthly_revenue_approx numeric(12,2) default 0,
  monthly_expenses_approx numeric(12,2) default 0,
  client_count_approx integer default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_business_slug on mercadeo.profiles(business_slug);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
create table mercadeo.products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text,
  sku text,

  cost_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  wholesale_price numeric(12,2),
  stock_quantity integer not null default 0,
  min_stock_alert integer default 5,

  images text[] default '{}',
  is_active boolean not null default true,
  tags text[] default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_business_id on mercadeo.products(business_id);
create index idx_products_category on mercadeo.products(category);
create index idx_products_is_active on mercadeo.products(is_active);

-- ============================================================
-- 3. PRODUCT VARIANTS
-- ============================================================
create table mercadeo.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references mercadeo.products(id) on delete cascade,
  variant_name text not null,
  variant_value text not null,
  additional_price numeric(12,2) default 0,
  stock_quantity integer not null default 0,
  sku text,

  created_at timestamptz not null default now()
);

create index idx_product_variants_product_id on mercadeo.product_variants(product_id);

-- ============================================================
-- 4. CUSTOMERS
-- ============================================================
create table mercadeo.customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  id_number text,

  debt_balance numeric(12,2) default 0,
  total_purchases numeric(12,2) default 0,
  purchase_count integer default 0,
  last_purchase_at timestamptz,

  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_customers_business_id on mercadeo.customers(business_id);

-- ============================================================
-- 5. SALES
-- ============================================================
create table mercadeo.sales (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,
  customer_id uuid references mercadeo.customers(id) on delete set null,

  total_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) default 0,
  tax_amount numeric(12,2) default 0,
  igtf_amount numeric(12,2) default 0,

  payment_method text not null default 'cash' check (payment_method in ('cash', 'transfer', 'mobile_pay', 'debt')),
  payment_currency text default 'USD',
  exchange_rate numeric(12,6) default 1,

  sale_type text not null default 'POS' check (sale_type in ('POS', 'Catalog')),
  sale_status text not null default 'completed' check (sale_status in ('pending', 'completed', 'cancelled', 'refunded')),
  notes text,

  created_at timestamptz not null default now()
);

create index idx_sales_business_id on mercadeo.sales(business_id);
create index idx_sales_customer_id on mercadeo.sales(customer_id);
create index idx_sales_created_at on mercadeo.sales(created_at);

-- ============================================================
-- 6. SALE ITEMS
-- ============================================================
create table mercadeo.sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid not null references mercadeo.sales(id) on delete cascade,
  product_id uuid not null references mercadeo.products(id) on delete restrict,
  variant_id uuid references mercadeo.product_variants(id) on delete set null,

  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  cost_price numeric(12,2) not null default 0,
  discount numeric(12,2) default 0,

  created_at timestamptz not null default now()
);

create index idx_sale_items_sale_id on mercadeo.sale_items(sale_id);
create index idx_sale_items_product_id on mercadeo.sale_items(product_id);

-- ============================================================
-- 7. EXPENSES
-- ============================================================
create table mercadeo.expenses (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  title text not null,
  description text,
  category text not null default 'Other',

  amount numeric(12,2) not null,
  currency text default 'USD',
  exchange_rate numeric(12,6) default 1,
  is_recurring boolean default false,
  recurring_frequency text check (recurring_frequency in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),

  expense_date date not null default current_date,
  receipt_url text,

  created_at timestamptz not null default now()
);

create index idx_expenses_business_id on mercadeo.expenses(business_id);
create index idx_expenses_expense_date on mercadeo.expenses(expense_date);

-- ============================================================
-- 8. ACCOUNTS RECEIVABLE
-- ============================================================
create table mercadeo.accounts_receivable (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,
  customer_id uuid not null references mercadeo.customers(id) on delete cascade,
  sale_id uuid references mercadeo.sales(id) on delete set null,

  total_amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null default 0,
  remaining_amount numeric(12,2) not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid', 'overdue', 'written_off')),
  notes text,

  created_at timestamptz not null default now()
);

create index idx_accounts_receivable_business_id on mercadeo.accounts_receivable(business_id);
create index idx_accounts_receivable_customer_id on mercadeo.accounts_receivable(customer_id);
create index idx_accounts_receivable_status on mercadeo.accounts_receivable(status);
create index idx_accounts_receivable_due_date on mercadeo.accounts_receivable(due_date);

-- ============================================================
-- 9. ACCOUNTS PAYABLE
-- ============================================================
create table mercadeo.accounts_payable (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  supplier_name text not null,
  description text,

  total_amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null default 0,
  remaining_amount numeric(12,2) not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid', 'overdue')),
  notes text,

  created_at timestamptz not null default now()
);

create index idx_accounts_payable_business_id on mercadeo.accounts_payable(business_id);
create index idx_accounts_payable_status on mercadeo.accounts_payable(status);
create index idx_accounts_payable_due_date on mercadeo.accounts_payable(due_date);

-- ============================================================
-- 10. EMPLOYEES
-- ============================================================
create table mercadeo.employees (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  full_name text not null,
  position text,
  phone text,
  email text,

  salary numeric(12,2) not null default 0,
  commission_rate numeric(5,2) default 0,
  hire_date date not null default current_date,
  is_active boolean not null default true,

  created_at timestamptz not null default now()
);

create index idx_employees_business_id on mercadeo.employees(business_id);

-- ============================================================
-- 11. CASH MOVEMENTS
-- ============================================================
create table mercadeo.cash_movements (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  type text not null check (type in ('income', 'expense', 'transfer', 'adjustment')),
  amount numeric(12,2) not null,
  currency text default 'USD',
  exchange_rate numeric(12,6) default 1,

  description text,
  category text,
  reference_id uuid,
  reference_type text,

  created_at timestamptz not null default now()
);

create index idx_cash_movements_business_id on mercadeo.cash_movements(business_id);
create index idx_cash_movements_created_at on mercadeo.cash_movements(created_at);

-- ============================================================
-- 12. EMERGENCY FUND
-- ============================================================
create table mercadeo.emergency_fund (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  target_amount numeric(12,2) not null default 0,
  current_amount numeric(12,2) not null default 0,
  monthly_contribution numeric(12,2) default 0,
  notes text,

  created_at timestamptz not null default now()
);

create index idx_emergency_fund_business_id on mercadeo.emergency_fund(business_id);

-- ============================================================
-- 13. ALERTS
-- ============================================================
create table mercadeo.alerts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  type text not null check (type in ('stock_low', 'debt_due', 'payment_received', 'subscription_expiring', 'custom')),
  title text not null,
  message text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),

  is_read boolean not null default false,
  action_url text,
  expires_at timestamptz,

  created_at timestamptz not null default now()
);

create index idx_alerts_business_id on mercadeo.alerts(business_id);
create index idx_alerts_is_read on mercadeo.alerts(is_read);

-- ============================================================
-- 14. AI CONVERSATIONS (Copilot)
-- ============================================================
create table mercadeo.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  title text,

  created_at timestamptz not null default now()
);

create index idx_ai_conversations_business_id on mercadeo.ai_conversations(business_id);

-- ============================================================
-- 15. AI MESSAGES (Copilot)
-- ============================================================
create table mercadeo.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references mercadeo.ai_conversations(id) on delete cascade,

  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_used integer default 0,

  created_at timestamptz not null default now()
);

create index idx_ai_messages_conversation_id on mercadeo.ai_messages(conversation_id);

-- ============================================================
-- 16. FINANCIAL PROJECTIONS
-- ============================================================
create table mercadeo.financial_projections (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  period_type text not null check (period_type in ('weekly', 'monthly', 'quarterly', 'yearly')),
  period_start date not null,
  period_end date not null,

  projected_revenue numeric(12,2) default 0,
  projected_expenses numeric(12,2) default 0,
  projected_profit numeric(12,2) default 0,

  actual_revenue numeric(12,2) default 0,
  actual_expenses numeric(12,2) default 0,
  actual_profit numeric(12,2) default 0,

  notes text,
  created_at timestamptz not null default now()
);

create index idx_financial_projections_business_id on mercadeo.financial_projections(business_id);

-- ============================================================
-- 17. INVESTMENTS
-- ============================================================
create table mercadeo.investments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,

  investor_name text not null,
  investment_amount numeric(12,2) not null,
  equity_percentage numeric(5,2) not null default 0,
  investment_date date not null default current_date,
  notes text,

  created_at timestamptz not null default now()
);

create index idx_investments_business_id on mercadeo.investments(business_id);

-- ============================================================
-- 18. AUDIT LOG
-- ============================================================
create table mercadeo.audit_log (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references mercadeo.profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,

  action text not null,
  table_name text not null,
  record_id uuid,

  old_data jsonb,
  new_data jsonb,

  created_at timestamptz not null default now()
);

create index idx_audit_log_business_id on mercadeo.audit_log(business_id);
create index idx_audit_log_table_name on mercadeo.audit_log(table_name);
create index idx_audit_log_created_at on mercadeo.audit_log(created_at);

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table mercadeo.profiles enable row level security;
alter table mercadeo.products enable row level security;
alter table mercadeo.product_variants enable row level security;
alter table mercadeo.customers enable row level security;
alter table mercadeo.sales enable row level security;
alter table mercadeo.sale_items enable row level security;
alter table mercadeo.expenses enable row level security;
alter table mercadeo.accounts_receivable enable row level security;
alter table mercadeo.accounts_payable enable row level security;
alter table mercadeo.employees enable row level security;
alter table mercadeo.cash_movements enable row level security;
alter table mercadeo.emergency_fund enable row level security;
alter table mercadeo.alerts enable row level security;
alter table mercadeo.ai_conversations enable row level security;
alter table mercadeo.ai_messages enable row level security;
alter table mercadeo.financial_projections enable row level security;
alter table mercadeo.investments enable row level security;
alter table mercadeo.audit_log enable row level security;

-- PROFILES: users can only CRUD their own profile
create policy "Users can view own profile"
  on mercadeo.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on mercadeo.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on mercadeo.profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on mercadeo.profiles for delete
  using (auth.uid() = id);

-- PRODUCTS: owner CRUD + public read for active catalog
create policy "Public can view active products"
  on mercadeo.products for select
  using (is_active = true);

create policy "Users can view own products"
  on mercadeo.products for select
  using (auth.uid() = business_id);

create policy "Users can insert own products"
  on mercadeo.products for insert
  with check (auth.uid() = business_id);

create policy "Users can update own products"
  on mercadeo.products for update
  using (auth.uid() = business_id);

create policy "Users can delete own products"
  on mercadeo.products for delete
  using (auth.uid() = business_id);

-- PRODUCT VARIANTS
create policy "Users can manage own product variants"
  on mercadeo.product_variants for all
  using (
    exists (
      select 1 from mercadeo.products
      where products.id = product_variants.product_id
        and products.business_id = auth.uid()
    )
  );

-- CUSTOMERS
create policy "Users can manage own customers"
  on mercadeo.customers for all
  using (auth.uid() = business_id);

-- SALES
create policy "Users can manage own sales"
  on mercadeo.sales for all
  using (auth.uid() = business_id);

-- SALE ITEMS
create policy "Users can manage own sale items"
  on mercadeo.sale_items for all
  using (
    exists (
      select 1 from mercadeo.sales
      where sales.id = sale_items.sale_id
        and sales.business_id = auth.uid()
    )
  );

-- EXPENSES
create policy "Users can manage own expenses"
  on mercadeo.expenses for all
  using (auth.uid() = business_id);

-- ACCOUNTS RECEIVABLE
create policy "Users can manage own accounts receivable"
  on mercadeo.accounts_receivable for all
  using (auth.uid() = business_id);

-- ACCOUNTS PAYABLE
create policy "Users can manage own accounts payable"
  on mercadeo.accounts_payable for all
  using (auth.uid() = business_id);

-- EMPLOYEES
create policy "Users can manage own employees"
  on mercadeo.employees for all
  using (auth.uid() = business_id);

-- CASH MOVEMENTS
create policy "Users can manage own cash movements"
  on mercadeo.cash_movements for all
  using (auth.uid() = business_id);

-- EMERGENCY FUND
create policy "Users can manage own emergency fund"
  on mercadeo.emergency_fund for all
  using (auth.uid() = business_id);

-- ALERTS
create policy "Users can manage own alerts"
  on mercadeo.alerts for all
  using (auth.uid() = business_id);

-- AI CONVERSATIONS
create policy "Users can manage own AI conversations"
  on mercadeo.ai_conversations for all
  using (auth.uid() = business_id);

-- AI MESSAGES
create policy "Users can manage own AI messages"
  on mercadeo.ai_messages for all
  using (
    exists (
      select 1 from mercadeo.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
        and ai_conversations.business_id = auth.uid()
    )
  );

-- FINANCIAL PROJECTIONS
create policy "Users can manage own financial projections"
  on mercadeo.financial_projections for all
  using (auth.uid() = business_id);

-- INVESTMENTS
create policy "Users can manage own investments"
  on mercadeo.investments for all
  using (auth.uid() = business_id);

-- AUDIT LOG
create policy "Users can manage own audit log"
  on mercadeo.audit_log for all
  using (auth.uid() = business_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on profiles
create or replace function mercadeo.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on mercadeo.profiles
  for each row execute function mercadeo.handle_updated_at();

create trigger set_products_updated_at
  before update on mercadeo.products
  for each row execute function mercadeo.handle_updated_at();

-- Auto-create profile on signup
create or replace function mercadeo.handle_new_user()
returns trigger as $$
begin
  insert into mercadeo.profiles (id, email, full_name, business_name, business_slug)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'business_name', new.email),
    lower(replace(replace(replace(
      coalesce(new.raw_user_meta_data->>'business_name', split_part(new.email, '@', 1)),
      ' ', '-'
    ), '.', '-'), '_', '-'))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function mercadeo.handle_new_user();
