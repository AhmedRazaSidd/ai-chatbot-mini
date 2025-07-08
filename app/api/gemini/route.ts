import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { initialMessage } from "@/lib/data";

export const runtime = "nodejs";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

const generateId = () => Math.random().toString(36).slice(2, 15);

const buildGoogleGenAIPrompt = (messages: Message[]): Message[] => [
  {
    id: generateId(),
    role: "user",
    content: initialMessage.content,
  },
  ...messages.map((message) => ({
    id: message.id || generateId(),
    role: message.role,
    content: message.content,
  })),
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[DEBUG] Request body:", body);

    const { messages } = body;
    if (!Array.isArray(messages)) {
      throw new Error("Invalid 'messages' format. Expected an array.");
    }

    const prompt = buildGoogleGenAIPrompt(messages);
    console.log("[DEBUG] Built prompt:", prompt);

    const stream = await streamText({
      model: google("gemini-1.5-pro"), // ✅ FIXED: Correct model name
      messages: prompt,
      temperature: 0.7,
    });

    return stream.toAIStreamResponse(); // ✅ correct stream response handler
  } catch (error: any) {
    console.error("[ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
