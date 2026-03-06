import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    if (!_client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error(
                "GEMINI_API_KEY is not set. Add it to your .env.local file."
            );
        }
        _client = new GoogleGenerativeAI(apiKey);
    }
    return _client;
}

/**
 * Returns a configured Gemini 2.5 Flash Lite model instance.
 * This function is safe to call multiple times — the client is a singleton.
 */
export function getGeminiModel() {
    return getClient().getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
            temperature: 0.1, // Low temperature for consistent structured output
            maxOutputTokens: 8192,
        },
    });
}
