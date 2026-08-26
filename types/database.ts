export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  mercadeo: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          country: string | null;
          id_number: string | null;
          business_name: string;
          business_slug: string;
          business_size: string | null;
          business_type: "personal" | "business";
          legal_type: string | null;
          rif_number: string | null;
          rif_image_url: string | null;
          category_niche: string | null;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          primary_color: string | null;
          phone_whatsapp: string | null;
          social_links: Json | null;
          subscription_plan: string;
          subscription_status: "trialing" | "active" | "past_due" | "canceled";
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          monthly_revenue_approx: number;
          monthly_expenses_approx: number;
          client_count_approx: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          country?: string | null;
          id_number?: string | null;
          business_name: string;
          business_slug: string;
          business_size?: string | null;
          business_type?: "personal" | "business";
          legal_type?: string | null;
          rif_number?: string | null;
          rif_image_url?: string | null;
          category_niche?: string | null;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          primary_color?: string | null;
          phone_whatsapp?: string | null;
          social_links?: Json | null;
          subscription_plan?: string;
          subscription_status?: "trialing" | "active" | "past_due" | "canceled";
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          monthly_revenue_approx?: number;
          monthly_expenses_approx?: number;
          client_count_approx?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          country?: string | null;
          id_number?: string | null;
          business_name?: string;
          business_slug?: string;
          business_size?: string | null;
          business_type?: "personal" | "business";
          legal_type?: string | null;
          rif_number?: string | null;
          rif_image_url?: string | null;
          category_niche?: string | null;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          primary_color?: string | null;
          phone_whatsapp?: string | null;
          social_links?: Json | null;
          subscription_plan?: string;
          subscription_status?: "trialing" | "active" | "past_due" | "canceled";
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          monthly_revenue_approx?: number;
          monthly_expenses_approx?: number;
          client_count_approx?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          category: string | null;
          sku: string | null;
          cost_price: number;
          selling_price: number;
          wholesale_price: number | null;
          stock_quantity: number;
          min_stock_alert: number | null;
          images: string[];
          is_active: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          sku?: string | null;
          cost_price?: number;
          selling_price?: number;
          wholesale_price?: number | null;
          stock_quantity?: number;
          min_stock_alert?: number | null;
          images?: string[];
          is_active?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          sku?: string | null;
          cost_price?: number;
          selling_price?: number;
          wholesale_price?: number | null;
          stock_quantity?: number;
          min_stock_alert?: number | null;
          images?: string[];
          is_active?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          variant_name: string;
          variant_value: string;
          additional_price: number;
          stock_quantity: number;
          sku: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_name: string;
          variant_value: string;
          additional_price?: number;
          stock_quantity?: number;
          sku?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_name?: string;
          variant_value?: string;
          additional_price?: number;
          stock_quantity?: number;
          sku?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          id_number: string | null;
          debt_balance: number;
          total_purchases: number;
          purchase_count: number;
          last_purchase_at: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          id_number?: string | null;
          debt_balance?: number;
          total_purchases?: number;
          purchase_count?: number;
          last_purchase_at?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          id_number?: string | null;
          debt_balance?: number;
          total_purchases?: number;
          purchase_count?: number;
          last_purchase_at?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          total_amount: number;
          discount_amount: number;
          tax_amount: number;
          igtf_amount: number;
          payment_method: string;
          payment_currency: string;
          exchange_rate: number;
          sale_type: string;
          sale_status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string | null;
          total_amount?: number;
          discount_amount?: number;
          tax_amount?: number;
          igtf_amount?: number;
          payment_method?: string;
          payment_currency?: string;
          exchange_rate?: number;
          sale_type?: string;
          sale_status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string | null;
          total_amount?: number;
          discount_amount?: number;
          tax_amount?: number;
          igtf_amount?: number;
          payment_method?: string;
          payment_currency?: string;
          exchange_rate?: number;
          sale_type?: string;
          sale_status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          cost_price: number;
          discount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price: number;
          cost_price?: number;
          discount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price?: number;
          cost_price?: number;
          discount?: number;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          description: string | null;
          category: string;
          amount: number;
          currency: string;
          exchange_rate: number;
          is_recurring: boolean | null;
          recurring_frequency: string | null;
          expense_date: string;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          description?: string | null;
          category?: string;
          amount: number;
          currency?: string;
          exchange_rate?: number;
          is_recurring?: boolean | null;
          recurring_frequency?: string | null;
          expense_date?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          amount?: number;
          currency?: string;
          exchange_rate?: number;
          is_recurring?: boolean | null;
          recurring_frequency?: string | null;
          expense_date?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      accounts_receivable: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          sale_id: string | null;
          total_amount: number;
          paid_amount: number;
          remaining_amount: number;
          due_date: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          sale_id?: string | null;
          total_amount: number;
          paid_amount?: number;
          remaining_amount: number;
          due_date: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          sale_id?: string | null;
          total_amount?: number;
          paid_amount?: number;
          remaining_amount?: number;
          due_date?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      accounts_payable: {
        Row: {
          id: string;
          business_id: string;
          supplier_name: string;
          description: string | null;
          total_amount: number;
          paid_amount: number;
          remaining_amount: number;
          due_date: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          supplier_name: string;
          description?: string | null;
          total_amount: number;
          paid_amount?: number;
          remaining_amount: number;
          due_date: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          supplier_name?: string;
          description?: string | null;
          total_amount?: number;
          paid_amount?: number;
          remaining_amount?: number;
          due_date?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          business_id: string;
          full_name: string;
          position: string | null;
          phone: string | null;
          email: string | null;
          salary: number;
          commission_rate: number | null;
          hire_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          full_name: string;
          position?: string | null;
          phone?: string | null;
          email?: string | null;
          salary?: number;
          commission_rate?: number | null;
          hire_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          full_name?: string;
          position?: string | null;
          phone?: string | null;
          email?: string | null;
          salary?: number;
          commission_rate?: number | null;
          hire_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      cash_movements: {
        Row: {
          id: string;
          business_id: string;
          type: string;
          amount: number;
          currency: string;
          exchange_rate: number;
          description: string | null;
          category: string | null;
          reference_id: string | null;
          reference_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          type: string;
          amount: number;
          currency?: string;
          exchange_rate?: number;
          description?: string | null;
          category?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          type?: string;
          amount?: number;
          currency?: string;
          exchange_rate?: number;
          description?: string | null;
          category?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          created_at?: string;
        };
      };
      emergency_fund: {
        Row: {
          id: string;
          business_id: string;
          target_amount: number;
          current_amount: number;
          monthly_contribution: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          target_amount?: number;
          current_amount?: number;
          monthly_contribution?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          target_amount?: number;
          current_amount?: number;
          monthly_contribution?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          business_id: string;
          type: string;
          title: string;
          message: string;
          severity: string;
          is_read: boolean;
          action_url: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          type: string;
          title: string;
          message: string;
          severity?: string;
          is_read?: boolean;
          action_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          type?: string;
          title?: string;
          message?: string;
          severity?: string;
          is_read?: boolean;
          action_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          business_id: string;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title?: string | null;
          created_at?: string;
        };
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          tokens_used?: number | null;
          created_at?: string;
        };
      };
      financial_projections: {
        Row: {
          id: string;
          business_id: string;
          period_type: string;
          period_start: string;
          period_end: string;
          projected_revenue: number | null;
          projected_expenses: number | null;
          projected_profit: number | null;
          actual_revenue: number | null;
          actual_expenses: number | null;
          actual_profit: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          period_type: string;
          period_start: string;
          period_end: string;
          projected_revenue?: number | null;
          projected_expenses?: number | null;
          projected_profit?: number | null;
          actual_revenue?: number | null;
          actual_expenses?: number | null;
          actual_profit?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          period_type?: string;
          period_start?: string;
          period_end?: string;
          projected_revenue?: number | null;
          projected_expenses?: number | null;
          projected_profit?: number | null;
          actual_revenue?: number | null;
          actual_expenses?: number | null;
          actual_profit?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      investments: {
        Row: {
          id: string;
          business_id: string;
          investor_name: string;
          investment_amount: number;
          equity_percentage: number;
          investment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          investor_name: string;
          investment_amount: number;
          equity_percentage?: number;
          investment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          investor_name?: string;
          investment_amount?: number;
          equity_percentage?: number;
          investment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["mercadeo"]["Tables"]> =
  Database["mercadeo"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["mercadeo"]["Tables"]> =
  Database["mercadeo"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["mercadeo"]["Tables"]> =
  Database["mercadeo"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
