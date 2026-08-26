"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component
          }
        },
      },
      db: { schema: 'mercadeo' },
    }
  )
}

export async function signUp(
  email: string,
  password: string,
  userData: {
    first_name: string
    last_name: string
    country: string
    location: string
    cedula: string
    phone: string
    user_type: "personal" | "business"
  }
) {
  const supabase = await getSupabase()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${userData.first_name} ${userData.last_name}`,
        business_name: "",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    const slug = `${userData.first_name.toLowerCase()}-${userData.last_name.toLowerCase()}-${Date.now()}`

    const { error: profileError } = await supabase.schema("mercadeo").from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: `${userData.first_name} ${userData.last_name}`,
      phone: userData.phone,
      country: userData.country,
      id_number: userData.cedula,
      business_name: "",
      business_slug: slug,
      business_type: userData.user_type,
      category_niche: null,
      description: null,
      logo_url: null,
      banner_url: null,
      primary_color: "#10B981",
      phone_whatsapp: userData.phone,
      social_links: {},
      subscription_plan: "free_trial",
      subscription_status: "trialing",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      stripe_customer_id: null,
      stripe_subscription_id: null,
      monthly_revenue_approx: 0,
      monthly_expenses_approx: 0,
      client_count_approx: 0,
      business_size: null,
      legal_type: null,
      rif_number: null,
      rif_image_url: null,
    } as Record<string, unknown>)

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath("/", "layout")
  return { error: null }
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { error: null }
}

export async function signOut() {
  const supabase = await getSupabase()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function updateProfile(profileData: Record<string, unknown>) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .schema("mercadeo").from("profiles")
    .update(profileData)
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { error: null }
}

export async function getCurrentUser() {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .schema("mercadeo").from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return { user, profile }
}
