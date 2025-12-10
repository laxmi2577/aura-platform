"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

/**
 * Authentication Termination Utility.
 * Provides a secure mechanism to end the current Supabase session, clear local auth tokens,
 * and redirect the user back to the public login route.
 */
export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium border rounded-md border-border hover:bg-accent"
    >
      Sign Out
    </button>
  )
}