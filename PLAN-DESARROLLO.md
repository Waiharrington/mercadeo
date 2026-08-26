# MERCADEO - Plan de Desarrollo Completo

## Vision
Plataforma SaaS todo-en-une para gestionion de negocios PyMEs, comparable y superior a Fina Partner. enfocada en mercados hispanohablantes con soporte multimoneda, IA integrada y modularidad total.

---

## FASE 1: Fundamentos (Sprint 1-2)

### 1.1 Infraestructura Base
- [x] Next.js 16 + TypeScript + Tailwind v4 + Shadcn UI
- [x] Supabase SSR client (browser/server/middleware)
- [x] Middleware de autenticacion
- [ ] **.env.local** con credenciales Supabase
- [ ] **SQL Schema completo** en Supabase (migraciones)
- [ ] **Tipos corregidos** (reconciliar database.ts con index.ts)
- [ ] **next.config.ts** configurado (imagenes, redirects)

### 1.2 Schema de Base de Datos (Supabase SQL)

```sql
-- PERFILES / NEGOCIOS
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'VE',
  id_number TEXT, -- cedula/RIF
  business_name TEXT,
  business_slug TEXT UNIQUE,
  business_size TEXT, -- 'small','medium','large'
  business_type TEXT, -- 'personal','business'
  legal_type TEXT, -- 'persona_natural','firma_juridica'
  rif_number TEXT,
  rif_image_url TEXT,
  category_niche TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT DEFAULT '#0A2540',
  phone_whatsapp TEXT,
  social_links JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'trial', -- 'trial','personal','business'
  subscription_status TEXT DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_revenue_approx NUMERIC,
  monthly_expenses_approx NUMERIC,
  client_count_approx INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTOS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  sku TEXT,
  cost_price NUMERIC(10,2) DEFAULT 0,
  selling_price NUMERIC(10,2) NOT NULL,
  wholesale_price NUMERIC(10,2),
  stock_quantity INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VARIANTES DE PRODUCTO (talla, color, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- 'Talla', 'Color'
  variant_value TEXT NOT NULL, -- 'M', 'Rojo'
  additional_price NUMERIC(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTES
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  id_number TEXT,
  debt_balance NUMERIC(10,2) DEFAULT 0,
  total_purchases NUMERIC(10,2) DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENTAS / ORDENES
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  total_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  igtf_amount NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT NOT NULL, -- 'cash','transfer','mobile_pay','card','debt','mixed'
  payment_currency TEXT DEFAULT 'USD', -- 'USD','VES'
  exchange_rate NUMERIC(10,2),
  sale_type TEXT DEFAULT 'POS', -- 'POS','Catalog','Manual'
  sale_status TEXT DEFAULT 'completed', -- 'pending','confirmed','completed','cancelled','refunded'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DETALLE DE VENTAS
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GASTOS
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'rent','payroll','suppliers','utilities','marketing','taxes','other'
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,2),
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'weekly','biweekly','monthly','quarterly','yearly'
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUENTAS POR COBRAR / PAGAR
CREATE TABLE accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  sale_id UUID REFERENCES sales(id),
  total_amount NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  remaining_amount NUMERIC(10,2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending','partial','paid','overdue'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  remaining_amount NUMERIC(10,2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLEADOS / NOMINA
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  email TEXT,
  salary NUMERIC(10,2) DEFAULT 0,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MOVIMIENTOS DE CAJA
CREATE TABLE cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'income','expense','transfer'
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,2),
  description TEXT,
  category TEXT,
  reference_id UUID,
  reference_type TEXT, -- 'sale','expense','transfer'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FONDO DE EMERGENCIA
CREATE TABLE emergency_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_amount NUMERIC(10,2) NOT NULL,
  current_amount NUMERIC(10,2) DEFAULT 0,
  monthly_contribution NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALERTAS Y RECORDATORIOS
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'low_stock','debt_due','tax_due','custom'
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT DEFAULT 'info', -- 'info','warning','critical'
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSACIONES IA (COPILOTO)
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user','assistant','system'
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROYECCIONES FINANCIERAS
CREATE TABLE financial_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- 'weekly','monthly','quarterly','yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  projected_revenue NUMERIC(10,2),
  projected_expenses NUMERIC(10,2),
  projected_profit NUMERIC(10,2),
  actual_revenue NUMERIC(10,2),
  actual_expenses NUMERIC(10,2),
  actual_profit NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVERSIONES / SOCIOS
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  investment_amount NUMERIC(10,2) NOT NULL,
  equity_percentage NUMERIC(5,2), -- porcentaje de socios
  investment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HISTORIAL DE CAMBIOS (AUDIT LOG)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'create','update','delete'
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDICES
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_sales_business ON sales(business_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_expenses_business ON expenses(business_id);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_accounts_receivable_business ON accounts_receivable(business_id);
CREATE INDEX idx_accounts_payable_business ON accounts_payable(business_id);
CREATE INDEX idx_employees_business ON employees(business_id);
CREATE INDEX idx_cash_movements_business ON cash_movements(business_id);
CREATE INDEX idx_alerts_business ON alerts(business_id);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_fund ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Politicas RLS: cada usuario solo ve sus datos
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Politicas para tablas de negocio (via business_id)
CREATE POLICY "Business access" ON products FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON product_variants FOR ALL USING (product_id IN (SELECT id FROM products WHERE business_id = auth.uid()));
CREATE POLICY "Business access" ON customers FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON sales FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON sale_items FOR ALL USING (sale_id IN (SELECT id FROM sales WHERE business_id = auth.uid()));
CREATE POLICY "Business access" ON expenses FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON accounts_receivable FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON accounts_payable FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON employees FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON cash_movements FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON emergency_fund FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON alerts FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON ai_conversations FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON ai_messages FOR ALL USING (conversation_id IN (SELECT id FROM ai_conversations WHERE business_id = auth.uid()));
CREATE POLICY "Business access" ON financial_projections FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON investments FOR ALL USING (business_id = auth.uid());
CREATE POLICY "Business access" ON audit_log FOR ALL USING (business_id = auth.uid());

-- Catalogo publico: cualquiera puede ver productos activos
CREATE POLICY "Public catalog" ON products FOR SELECT USING (is_active = true);
```

---

## FASE 2: Autenticacion y Onboarding (Sprint 2-3)

### 2.1 Formulario de Registro (Flujo del diagrama)

**Paso 1 - Registro Usuario:**
- Nombre, Apellido, Correo, Contrasena, Pais, Ubicacion, Cedula, Telefono
- Boton: Tipo de Uso (Personal / Empresa)

**Paso 2 - Si es PERSONA:**
- Ingreso aproximado mensual
- Gastos fijos
- Proposito: Ahorro / Control / Inversion
- Redirige a Finanzas Personales

**Paso 2 - Si es EMPRESA:**
- Nombre de Empresa, Tamano (Grande/Emprendimiento)
- Tiene RIF? (Si/No)
  - Si: Modulo OCR para cargar imagen RIF (extraer RIF y ubicacion fiscal)
  - No: Tipo Persona (Firma Juridica / Persona Natural)
- Datos Operativos Empresa:
  - Descripcion del negocio
  - Producto/Modelo/Nicho
  - Volumen de clientes
  - Ingreso aprox, Gastos aprox

### 2.2 Seleccion de Planes

| Plan | Precio | Incluye |
|------|--------|---------|
| **Prueba 7 Dias** | Gratis | Acceso total por 7 dias |
| **Personal** | $3.99/mes | Finanzas, Alertas, IA Basica |
| **Empresarial** | $6.99/mes | Todo incluido + Multi-sucursal + Nomina |

### 2.3 Pasarela de Pago
- **Medios aceptados:** Pago Movil, Tarjeta Credito USA, PayPal, Binance Pay
- **Validacion Anti-Abuso:** Cedula, RIF, Telefono, Empresa
- **Stripe Checkout** para tarjetas internacionales

### 2.4 Personalizacion de UI / Branding
- Logo del negocio
- Nombre comercial
- Paleta HEX de colores
- Extraccion IA de nicho para suggerir tema

### 2.5 Componentes a Crear
- `app/(auth)/register/step-1.tsx` - Datos personales
- `app/(auth)/register/step-2-personal.tsx` - Finanzas personales
- `app/(auth)/register/step-2-business.tsx` - Datos empresa
- `app/(auth)/register/step-3-rif.tsx` - OCR de RIF
- `app/(auth)/register/step-4-plan.tsx` - Seleccion de plan
- `app/(auth)/register/step-5-payment.tsx` - Pasarela de pago
- `app/(auth)/register/step-6-branding.tsx` - Personalizacion

---

## FASE 3: Modulos Core (Sprint 3-5)

### 3.1 Modulo Obligatorio: FINANZAS CENTRAL
**Ruta:** `/dashboard/finances`

**Funcionalidades:**
- Panel de Ingresos/Gastos en tiempo real
- Inversiones y Socios (% por acciones)
- Cuentas por Cobrar/Pagar con alertas de vencimiento
- Resumen financiero mensual/anual
- Graficos de flujo de caja
- Multimoneda (Bs./$) con tasa BCV automatica
- Reportes exportables (PDF/Excel)

**Componentes:**
- `app/(dashboard)/finances/page.tsx` - Dashboard financiero principal
- `app/(dashboard)/finances/income/page.tsx` - Ingresos
- `app/(dashboard)/finances/expenses/page.tsx` - Gastos
- `app/(dashboard)/finances/accounts-receivable/page.tsx` - Cuentas por cobrar
- `app/(dashboard)/finances/accounts-payable/page.tsx` - Cuentas por pagar
- `app/(dashboard)/finances/investments/page.tsx` - Inversiones/Socios
- `components/finances/finance-summary-card.tsx`
- `components/finances/cash-flow-chart.tsx`
- `components/finances/currency-converter.tsx`

**Server Actions:**
- `lib/actions/finances.ts` - CRUD ingresos, gastos, cuentas

### 3.2 Modulo: CONTROL DE INVENTARIO
**Ruta:** `/dashboard/inventory`

**Funcionalidades:**
- Buscador de stock con fotos
- Control de costos y margen de ganancia por producto
- Top 10 productos por eficiencia/rotacion
- Alertas de stock bajo automaticas
- Variantes (talla, color, tamano)
- Carga masiva desde CSV/Excel
- Historial de movimientos de inventario

**Componentes:**
- `app/(dashboard)/inventory/page.tsx` - Lista de productos
- `app/(dashboard)/inventory/[id]/page.tsx` - Detalle producto
- `app/(dashboard)/inventory/new/page.tsx` - Crear producto
- `app/(dashboard)/inventory/categories/page.tsx` - Categorias
- `components/inventory/product-card.tsx`
- `components/inventory/stock-alert.tsx`
- `components/inventory/variant-manager.tsx`

**Server Actions:**
- `lib/actions/products.ts` - CRUD productos
- `lib/actions/variants.ts` - CRUD variantes

### 3.3 Modulo: CATALOGO ONLINE VIP
**Ruta:** `/dashboard/catalog` (admin) + `/[slug]` (publico)

**Funcionalidades:**
- Tienda online publica por negocio
- Telefono WhatsApp de destino en cada producto
- Buscador de items
- Carrito de venta directa
- Compartir por redes sociales
- SEO optimizado por producto
- Tema personalizable (colores del negocio)

**Componentes:**
- `app/(public)/catalog/[slug]/page.tsx` - Catalogo publico
- `app/(public)/catalog/[slug]/product/[id]/page.tsx` - Detalle producto
- `components/catalog/product-grid.tsx`
- `components/catalog/cart.tsx`
- `components/catalog/whatsapp-button.tsx`
- `components/catalog/catalog-header.tsx`

**Server Actions:**
- `lib/actions/catalog.ts` - Fetch productos publicos

### 3.4 Modulo: FACTURACION Y RECIBOS
**Ruta:** `/dashboard/billing`

**Funcionalidades:**
- Emision de facturas de venta (PDF)
- Boleta de venta (PDF/PNG)
- Notas de entrega
- Recibos de compra
- Numeracion automatica
- Plantillas personalizables con logo del negocio
- Envio por WhatsApp/Email

**Componentes:**
- `app/(dashboard)/billing/page.tsx` - Lista de facturas
- `app/(dashboard)/billing/new/page.tsx` - Nueva factura
- `app/(dashboard)/billing/[id]/page.tsx` - Detalle factura
- `components/billing/invoice-preview.tsx`
- `components/billing/invoice-pdf.tsx`
- `components/billing/receipt-card.tsx`

**Server Actions:**
- `lib/actions/billing.ts` - CRUD facturas, generacion PDF

### 3.5 Modulo: NOMINA Y PERSONAL
**Ruta:** `/dashboard/payroll`

**Funcionalidades:**
- Registro de empleados
- Puestos y salarios
- Comisiones por ventas
- Control de asistencia basico
- Calculo de nomina mensual
- Reporte de comisiones

**Componentes:**
- `app/(dashboard)/payroll/page.tsx` - Lista empleados
- `app/(dashboard)/payroll/[id]/page.tsx` - Detalle empleado
- `app/(dashboard)/payroll/commissions/page.tsx` - Comisiones
- `components/payroll/employee-card.tsx`
- `components/payroll/commission-calculator.tsx`

**Server Actions:**
- `lib/actions/payroll.ts` - CRUD empleados, calculo nomina

### 3.6 Modulo: CONTABILIDAD
**Ruta:** `/dashboard/accounting`

**Funcionalidades:**
- Exportacion automatica de paquete contable (PDF/Excel)
- Balance general
- Estado de resultados
- Libro de compras/ventas
- Conciliacion bancaria basica
-整合 con contador externo (compartir acceso)

**Componentes:**
- `app/(dashboard)/accounting/page.tsx` - Resumen contable
- `app/(dashboard)/accounting/reports/page.tsx` - Reportes
- `components/accounting/balance-sheet.tsx`
- `components/accounting/accounting-export.tsx`

### 3.7 Modulo: ASISTENTE IA FINANCIERO (COPILOTO)
**Ruta:** `/dashboard/copilot`

**Funcionalidades:**
- Chat con IA que conoce el negocio
- Preguntas en lenguaje natural sobre ventas, inventario, clientes
- Recomendaciones de pricing basadas en margen
- Alertas inteligentes de inversion/reduccion de stock
- Analisis de tendencias de ventas
- Sugerencias de marketing
- Resumen ejecutivo diario/semanal

**Componentes:**
- `app/(dashboard)/copilot/page.tsx` - Chat IA
- `components/copilot/chat-interface.tsx`
- `components/copilot/message-bubble.tsx`
- `components/copilot/quick-actions.tsx`
- `components/copilot/insight-cards.tsx`

**API Routes:**
- `app/api/copilot/route.ts` - Endpoint IA (Vercel AI SDK + OpenAI/Claude)

### 3.8 Modulo: ALERTAS Y RECORDATORIOS
**Ruta:** `/dashboard/alerts`

**Funcionalidades:**
- Alertas de stock bajo automaticas
- Recordatorios de deudas por vencer
- Alertas de impuestos/facturas pendientes
- Notificaciones push (web push)
- Resumen diario por email/WhatsApp
- Alertas personalizables

**Componentes:**
- `app/(dashboard)/alerts/page.tsx` - Lista de alertas
- `components/alerts/alert-card.tsx`
- `components/alerts/alert-settings.tsx`

### 3.9 Modulo: PROYECCION Y MARKETING
**Ruta:** `/dashboard/marketing`

**Funcionalidades:**
- Proyecciones de ventas (semanal/mensual/anual)
- Campañas de marketing por WhatsApp/SMS
- Segmentacion de clientes
- Estadisticas de campanas
- Recordatorios a clientes inactivos
- Recuperacion de clientes perdidos

**Componentes:**
- `app/(dashboard)/marketing/page.tsx` - Dashboard marketing
- `app/(dashboard)/marketing/campaigns/page.tsx` - Campanas
- `app/(dashboard)/marketing/segments/page.tsx` - Segmentacion
- `components/marketing/campaign-card.tsx`
- `components/marketing/customer-segment.tsx`

### 3.10 Modulo: FONDO DE EMERGENCIA
**Ruta:** `/dashboard/emergency-fund`

**Funcionalidades:**
- Meta de fondo de emergencia
- Contribuciones mensuales automaticas
- Grafico de progreso
- Simulador de tiempo para alcanzar meta
- Alertas cuando esta por debajo del minimo

**Componentes:**
- `app/(dashboard)/emergency-fund/page.tsx` - Dashboard fondo
- `components/emergency-fund/progress-bar.tsx`
- `components/emergency-fund/contribution-form.tsx`

---

## FASE 4: Funcionalidades Avanzadas (Sprint 5-7)

### 4.1 Multi-Moneda (Bs./$)
- Tasa BCV automatica (API)
- Conversion automatica en ventas/gastos
- Cierres de caja multimoneda
- IGTF automatico cuando aplica

### 4.2 Integracion WhatsApp
- Enviar facturas por WhatsApp
- Campañas masivas
- Notificaciones de pedidos
- Chat bot basico

### 4.3 Reportes Avanzados
- Dashboard ejecutivo
- Reportes por periodo
- Comparativas mes a mes
- Exportacion PDF/Excel/CSV
- Reportes para contador

### 4.4 Multi-Sucursal
- Varios negocios desde una cuenta
- Inventario consolidado
- Reportes por sucursal
- Transferencias entre sucursales

### 4.5 App Movil (PWA)
- Progressive Web App
- Acceso desde celular
- Funcionamiento offline basico
- Notificaciones push

---

## FASE 5: Monetizacion y Escalamiento (Sprint 7-8)

### 5.1 Integracion Stripe
- Checkout para suscripciones
- Webhooks para estados
- Facturacion automatica
- Soporte para Pago Movil (Venezuela)

### 5.2 Landing Page Mejorado
- SEO optimizado
- Testimonios de usuarios
- Comparativa con competencia
- Demo interactiva

### 5.3 Analytics
- Metricas de uso
- Dashboard de admin
- Conversiones de trial a pago
- Churn rate

---

## ESTRUCTURA DE ARCHIVOS FINAL

```
mercadeo/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/
│   │   │   ├── page.tsx (step-1)
│   │   │   ├── step-2-personal/page.tsx
│   │   │   ├── step-2-business/page.tsx
│   │   │   ├── step-3-rif/page.tsx
│   │   │   ├── step-4-plan/page.tsx
│   │   │   ├── step-5-payment/page.tsx
│   │   │   └── step-6-branding/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── finances/
│   │   │   ├── page.tsx
│   │   │   ├── income/page.tsx
│   │   │   ├── expenses/page.tsx
│   │   │   ├── accounts-receivable/page.tsx
│   │   │   ├── accounts-payable/page.tsx
│   │   │   └── investments/page.tsx
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── categories/page.tsx
│   │   ├── catalog-admin/page.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── payroll/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── commissions/page.tsx
│   │   ├── accounting/
│   │   │   ├── page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── copilot/page.tsx
│   │   ├── alerts/page.tsx
│   │   ├── marketing/
│   │   │   ├── page.tsx
│   │   │   ├── campaigns/page.tsx
│   │   │   └── segments/page.tsx
│   │   ├── emergency-fund/page.tsx
│   │   └── settings/page.tsx
│   ├── (public)/
│   │   ├── catalog/[slug]/page.tsx
│   │   └── catalog/[slug]/product/[id]/page.tsx
│   ├── api/
│   │   ├── copilot/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   └── exchange-rate/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn)
│   ├── layout/
│   ├── marketing/
│   ├── finances/
│   ├── inventory/
│   ├── catalog/
│   ├── billing/
│   ├── customers/
│   ├── payroll/
│   ├── copilot/
│   ├── alerts/
│   ├── marketing/
│   └── emergency-fund/
├── lib/
│   ├── supabase/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── finances.ts
│   │   ├── products.ts
│   │   ├── customers.ts
│   │   ├── sales.ts
│   │   ├── billing.ts
│   │   ├── payroll.ts
│   │   ├── alerts.ts
│   │   ├── marketing.ts
│   │   └── catalog.ts
│   ├── hooks/
│   └── utils.ts
├── types/
│   ├── database.ts
│   └── index.ts
└── public/
```

---

## ORDEN DE EJECUCION (Agentes)

1. **Agente 1:** Schema SQL + Migraciones + Correccion de tipos
2. **Agente 2:** Auth completo (login, register multi-step, sesiones)
3. **Agente 3:** Server Actions core (finances, products, customers, sales)
4. **Agente 4:** Dashboard principal + Layout sidebar actualizado
5. **Agente 5:** Modulo Finanzas completo
6. **Agente 6:** Modulo Inventario completo
7. **Agente 7:** Modulo Clientes + Ventas/Ordenes
8. **Agente 8:** Modulo Catalogo Online publico
9. **Agente 9:** Modulo Facturacion/Recibos
10. **Agente 10:** Modulo Nomina + Contabilidad
11. **Agente 11:** Modulo Copilot IA
12. **Agente 12:** Modulos restantes (Alertas, Marketing, Fondo Emergencia)
