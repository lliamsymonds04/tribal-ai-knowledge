import { NextRequest, NextResponse } from "next/server";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/embeddings";

// Default system prompt for AI interviewer
const DEFAULT_SYSTEM_PROMPT = `You are an experienced and empathetic AI interviewer. Your role is to conduct thoughtful, engaging interviews that help candidates showcase their skills and experience.

Guidelines:
- Ask clear, relevant questions based on the conversation context
- Listen actively and ask follow-up questions to dive deeper
- Be encouraging and professional
- Help candidates feel comfortable while maintaining professionalism
- Adapt your questions based on their responses
- Keep questions concise and focused

Start by introducing yourself and asking the candidate to tell you about themselves.`;

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: Message[];
  systemPrompt?: string;
  useRAG?: boolean;
  ragMatchCount?: number;
  ragMatchThreshold?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key first
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error: ANTHROPIC_API_KEY is not set" },
        { status: 500 },
      );
    }

    const body: ChatRequest = await request.json();
    const {
      message,
      history = [],
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      useRAG = false,
      ragMatchCount = 5,
      ragMatchThreshold = 0.78,
    } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Retrieve relevant context using RAG if enabled
    let relevantContext = "";
    if (useRAG) {
      console.log('🔍 RAG ENABLED - Starting retrieval...');
      console.log('📝 User query:', message);
      console.log('⚙️ RAG settings:', { ragMatchThreshold, ragMatchCount });

      try {
        console.log('🧮 Generating embedding for query...');
        const queryEmbedding = await generateEmbedding(message);
        console.log('✅ Embedding generated, length:', queryEmbedding.length);

        console.log('🔎 Searching database with match_interview_documents...');
        const { data, error } = await supabaseAdmin.rpc(
          "match_interview_documents",
          {
            query_embedding: queryEmbedding,
            match_threshold: ragMatchThreshold,
            match_count: ragMatchCount,
          },
        );

        if (error) {
          console.error("❌ Error retrieving RAG context:", error);
        } else {
          console.log('📊 Search complete. Results found:', data?.length || 0);

          if (data && data.length > 0) {
            console.log('📄 Top results:');
            data.forEach((doc: any, i: number) => {
              console.log(`  ${i + 1}. Similarity: ${(doc.similarity * 100).toFixed(1)}%`);
              console.log(`     Content preview: ${doc.content.substring(0, 100)}...`);
              console.log(`     Metadata:`, doc.metadata);
            });

            relevantContext =
              "\n\nRelevant context from previous interviews:\n" +
              data
                .map(
                  (doc: {
                    content: string;
                    metadata: Record<string, unknown>;
                    similarity: number;
                  }) =>
                    `- ${doc.content} (relevance: ${(doc.similarity * 100).toFixed(1)}%)`,
                )
                .join("\n");

            console.log('✅ Context built, length:', relevantContext.length, 'characters');
          } else {
            console.log('⚠️ No matching documents found (threshold may be too high)');
          }
        }
      } catch (ragError) {
        console.error("❌ RAG retrieval error:", ragError);
        // Continue without RAG context if there's an error
      }
    } else {
      console.log('ℹ️ RAG is disabled for this request');
    }

    // Initialize model with API key
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: CLAUDE_MODEL,
      temperature: 0.7,
    });

    // Convert history to LangChain message format
    const messages = [];

    // Add system prompt with RAG context if available
    const enhancedSystemPrompt = relevantContext
      ? `${systemPrompt}${relevantContext}`
      : systemPrompt;

    if (useRAG) {
      console.log('📤 Sending to Claude with context. System prompt length:', enhancedSystemPrompt.length);
      console.log('📋 Context included:', relevantContext.length > 0 ? 'YES' : 'NO');
    }

    messages.push(new SystemMessage(enhancedSystemPrompt));

    // Add conversation history
    for (const msg of history) {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === "assistant") {
        messages.push(new AIMessage(msg.content));
      }
    }

    // Add current message
    messages.push(new HumanMessage(message));

    // Get response from Claude
    const response = await model.invoke(messages);

    return NextResponse.json({
      message: response.content,
      success: true,
      ragUsed: useRAG,
      ragContextFound: relevantContext.length > 0,
    });
  } catch (error: any) {
    console.error("Chat error details:", {
      message: error.message,
      status: error.status,
      name: error.name,
      stack: error.stack,
    });

    // Handle Anthropic API errors
    if (error?.status === 401) {
      return NextResponse.json(
        {
          error:
            "Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY in .env.local",
        },
        { status: 500 },
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error.message,
        hint: "Check server logs for more details",
      },
      { status: 500 },
    );
  }
}
