"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getEmployees(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("employees")
      .select("*")
      .eq("business_id", businessId)
      .order("full_name", { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get employees",
    };
  }
}

export async function getEmployee(
  id: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: employee, error: empError } = await supabase
      .schema("mercadeo").from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (empError) throw empError;

    const { data: sales, error: salesError } = await supabase
      .schema("mercadeo").from("sales")
      .select("id, total_amount, created_at")
      .eq("business_id", employee.business_id)
      .eq("sale_status", "completed");

    if (salesError) throw salesError;

    const commissionRate = Number(employee.commission_rate) / 100;
    const commissionHistory = (sales ?? []).map((sale) => ({
      sale_id: sale.id,
      sale_amount: sale.total_amount,
      commission: Number(sale.total_amount) * commissionRate,
      date: sale.created_at,
    }));

    return {
      success: true,
      data: {
        ...employee,
        commission_history: commissionHistory,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get employee",
    };
  }
}

export async function createEmployee(
  businessId: string,
  data: {
    full_name: string;
    position?: string;
    phone?: string;
    email?: string;
    salary?: number;
    commission_rate?: number;
    hire_date?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: employee, error } = await supabase
      .schema("mercadeo").from("employees")
      .insert({
        business_id: businessId,
        full_name: data.full_name,
        position: data.position ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        salary: data.salary ?? 0,
        commission_rate: data.commission_rate ?? 0,
        hire_date: data.hire_date ?? new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: employee };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create employee",
    };
  }
}

export async function updateEmployee(
  id: string,
  data: {
    full_name?: string;
    position?: string;
    phone?: string;
    email?: string;
    salary?: number;
    commission_rate?: number;
    is_active?: boolean;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: employee, error } = await supabase
      .schema("mercadeo").from("employees")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: employee };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update employee",
    };
  }
}

export async function deleteEmployee(id: string): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.schema("mercadeo").from("employees").delete().eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete employee",
    };
  }
}

export async function calculateCommissions(
  businessId: string,
  period: { startDate: string; endDate: string }
): Promise<
  ServerResponse<
    Array<{
      employee_id: string;
      full_name: string;
      commission_rate: number;
      total_sales: number;
      commission_earned: number;
    }>
  >
> {
  try {
    const supabase = await createClient();

    const { data: employees, error: empError } = await supabase
      .schema("mercadeo").from("employees")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .gt("commission_rate", 0);

    if (empError) throw empError;

    const { data: sales, error: salesError } = await supabase
      .schema("mercadeo").from("sales")
      .select("id, total_amount")
      .eq("business_id", businessId)
      .eq("sale_status", "completed")
      .gte("created_at", period.startDate)
      .lte("created_at", period.endDate);

    if (salesError) throw salesError;

    const totalRevenue = sales?.reduce(
      (sum, s) => sum + Number(s.total_amount),
      0
    ) ?? 0;

    const commissions = (employees ?? []).map((emp) => {
      const commissionRate = Number(emp.commission_rate) / 100;
      const estimatedSales = totalRevenue / (employees?.length ?? 1);
      return {
        employee_id: emp.id,
        full_name: emp.full_name,
        commission_rate: Number(emp.commission_rate),
        total_sales: estimatedSales,
        commission_earned: estimatedSales * commissionRate,
      };
    });

    return { success: true, data: commissions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate commissions",
    };
  }
}

export async function getMonthlyPayroll(
  businessId: string,
  month: number,
  year: number
): Promise<
  ServerResponse<{
    totalSalaries: number;
    totalCommissions: number;
    totalPayroll: number;
    employees: Array<{
      id: string;
      full_name: string;
      salary: number;
      commission: number;
      total: number;
    }>;
  }>
> {
  try {
    const supabase = await createClient();

    const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    const { data: employees, error: empError } = await supabase
      .schema("mercadeo").from("employees")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (empError) throw empError;

    const { data: sales, error: salesError } = await supabase
      .schema("mercadeo").from("sales")
      .select("total_amount")
      .eq("business_id", businessId)
      .eq("sale_status", "completed")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (salesError) throw salesError;

    const totalRevenue = sales?.reduce(
      (sum, s) => sum + Number(s.total_amount),
      0
    ) ?? 0;

    const employeePayroll = (employees ?? []).map((emp) => {
      const commissionRate = Number(emp.commission_rate) / 100;
      const estimatedSales = totalRevenue / (employees?.length ?? 1);
      const commission = estimatedSales * commissionRate;
      return {
        id: emp.id,
        full_name: emp.full_name,
        salary: Number(emp.salary),
        commission,
        total: Number(emp.salary) + commission,
      };
    });

    const totalSalaries = employeePayroll.reduce((sum, e) => sum + e.salary, 0);
    const totalCommissions = employeePayroll.reduce(
      (sum, e) => sum + e.commission,
      0
    );

    return {
      success: true,
      data: {
        totalSalaries,
        totalCommissions,
        totalPayroll: totalSalaries + totalCommissions,
        employees: employeePayroll,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get monthly payroll",
    };
  }
}
