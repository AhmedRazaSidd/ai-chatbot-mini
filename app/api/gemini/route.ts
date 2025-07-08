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
    const { messages } = await request.json();
    const prompt = buildGoogleGenAIPrompt(messages);

    const stream = await streamText({
      model: google("gemini-1.5-flash"),
      messages: prompt,
      temperature: 0.7,
    });

    return stream?.toDataStreamResponse();
  } catch (error) {
    console.log(error);
  }
}
