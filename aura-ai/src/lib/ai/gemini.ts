import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable")
}

/**
 * Generative Model Client.
 * Initialized instance of the generative AI model, configured for high efficiency and low latency.
 * Used for semantic analysis, text generation, and RAG operations.
 */
const genAI = new GoogleGenerativeAI(apiKey || "")

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
})