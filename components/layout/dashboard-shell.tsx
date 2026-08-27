import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client"

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = user?.email?.charAt(0)?.toUpperCase() ?? "U"
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuario"
  const avatarUrl = user?.user_metadata?.avatar_url ?? null

  return (
    <DashboardShellClient
      user={user ? { email: user.email, displayName, initials, avatarUrl } : null}
      signOutAction={signOut}
    >
      {children}
    </DashboardShellClient>
  )
}
