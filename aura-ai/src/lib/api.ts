const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ""

if (!API_KEY) {
    console.warn("⚠️ Warning: NEXT_PUBLIC_API_KEY is not set.")
}

/**
 * Authenticated Inference Client.
 * Wrapper around the native fetch API for communicating with the Python microservice.
 * Automatically injects authentication headers and normalizes endpoint paths.
 * Provides unified error handling for inference requests.
 */
export async function fetchAI(endpoint: string, options: RequestInit = {}) {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

    const headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        ...(options.headers || {}),
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const errorBody = await response.text().catch(() => "Could not read error body")
        console.error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`)
        throw new Error(`AI API Error: ${response.statusText || response.status}`)
    }

    return response.json()
}
