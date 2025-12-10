"use client"

import { createBrowserClient } from "@supabase/ssr"

/**
 * Client-Side Database Connection Factory.
 * Initializes the Supabase client for use in browser environments (React components).
 * configured for public access using the anonymous key.
 */
export const createClient = () => {
    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    return client
}