import { geminiModel } from "@/lib/ai/gemini"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * AI Coach Interaction Endpoint.
 * Orchestrates a RAG (Retrieval-Augmented Generation) pipeline:
 * 1. Fetches relevant soundscapes and scientific facts in parallel.
 * 2. Constructs a context-aware system prompt.
 * 3. Generates a response using the generative model with conversation history.
 */
export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()

    console.log(`🤖 AI Coach received: "${message}"`)

    // Parallel execution of vector search requests for performance optimization
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ""

    const [soundRes, knowledgeRes] = await Promise.all([
      fetch(`${API_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ query: message, match_count: 10, match_threshold: 0.1 }),
      }),
      fetch(`${API_URL}/search-knowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ query: message, match_count: 3, match_threshold: 0.3 }),
      })
    ])

    // Process Sound Context
    let soundContext = "No relevant sounds found."
    if (soundRes.ok) {
      const data = await soundRes.json()
      if (data.results?.length) {
        soundContext = data.results.map((s: any) => `- ${s.title} (ID: ${s.id})`).join("\n")
      }
    }

    // Process Scientific Context
    let scienceContext = "No specific scientific data found."
    if (knowledgeRes.ok) {
      const data = await knowledgeRes.json()
      if (data.results?.length) {
        scienceContext = data.results.map((k: any) =>
          `FACT: "${k.content}"\nSOURCE: (${k.source})`
        ).join("\n\n")
      }
    }

    // Construct System Prompt
    const systemPrompt = `
      You are Aura, an expert Sleep & Relaxation Coach backed by neuroscience.
      
      RELEVANT SOUNDS LIBRARY:
      ${soundContext}

      SCIENTIFIC KNOWLEDGE BASE:
      ${scienceContext}

      INSTRUCTIONS:
      1. Answer the user's request with empathy.
      2. IF RELEVANT: Cite the provided scientific facts to back up your advice. (e.g., "According to Stanford Neurobiology...")
      3. Recommend a sound mix from the library.
      4. End with the JSON block to trigger the player.
      5. CRITICAL: End your response with the JSON block to trigger the player. 
         Do NOT use markdown code blocks (\`\`\`). Just use the pipes (|||).
      
      JSON FORMAT:
      |||JSON
    {
      "mix": [
        { "id": "UUID_FROM_LIST", "volume": 0.8 }
      ]
    }
      |||
      `

    const chat = geminiModel.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...history.filter((h: any) => !h.parts[0].text.includes("You are Aura"))
      ],
    })

    const result = await chat.sendMessage(message)
    const responseText = result.response.text()

    return NextResponse.json({ response: responseText })

  } catch (error: any) {
    console.error("AI Coach Error:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 })
  }
}