import { geminiModel } from "@/lib/ai/gemini"
import { NextResponse } from "next/server"

/**
 * Audio analysis endpoint.
 * Accepts an audio file URL and uses a generative model to extract descriptive tags.
 * facilitating automated metadata tagging for the sound library.
 */
export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json()

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 })
    }

    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()

    // Convert to Base64 for processing
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")

    const prompt = `
      Listen to this audio clip. 
      Identify the sounds (e.g., rain, piano, forest, white noise).
      Return a JSON list of 3-5 short, descriptive tags.
      Format: ["tag1", "tag2", "tag3"].
      Do NOT include markdown or explanations. Just the JSON array.
    `

    const result = await geminiModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/mp3",
          data: base64Audio
        }
      }
    ])

    const text = result.response.text()

    // Sanitize output to ensure valid JSON parsing
    const cleanedText = text.replace(/```json|```/g, "").trim()
    const tags = JSON.parse(cleanedText)

    return NextResponse.json({ tags })

  } catch (error) {
    console.error("AI Analysis Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze audio", details: error },
      { status: 500 }
    )
  }
}