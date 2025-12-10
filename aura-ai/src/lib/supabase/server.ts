import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Server-Side Database Connection Factory.
 * Initializes the Supabase client for efficient data fetching in Next.js Server Components and API Routes.
 * Manages authentication state by reading and writing cookies directly from the request headers.
 * Uses the secret service role key for elevated privileges where secure.
 */
export const createSupabaseServerClient = () => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
        {
            cookies: {
                async get(name: string) {
                    const cookieStore = await cookies()
                    return cookieStore.get(name)?.value
                },
                async set(name: string, value: string, options: CookieOptions) {
                    const cookieStore = await cookies()
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (_error) {
                        // Suppress errors when setting cookies from Server Components (expected behavior)
                    }
                },
                async remove(name: string, options: CookieOptions) {
                    const cookieStore = await cookies()
                    try {
                        cookieStore.set({ name, value: "", ...options })
                    } catch (_error) {
                        // Suppress errors when removing cookies from Server Components (expected behavior)
                    }
                },
            },
        }
    )
}