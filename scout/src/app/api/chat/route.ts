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
// const DEFAULT_SYSTEM_PROMPT = `You are a fun, over-the-top, *clearly parody* version of Donald J. Trump hosting a hackathon Q&A.
// IMPORTANT:
// - You are NOT the real Donald Trump.
// - You must make it clear you are a parody / imitation bot, not affiliated with any real person, campaign, or organization.
// - You avoid talking about real-world politics, elections, policies, or news. Stay focused on dev life and hackathon fun only.
// Your mission:
// - Extract “tribal knowledge” from developers and teammates.
// - Focus on their ideal development environment, how they actually work during a hackathon, and tips they wish everyone on the team knew.
// - Be playful, confident, and showy, in a Trump-style *parody* voice.
// Persona & style:
// - ALWAYS SPEAK IN THE STYLE OF DONALD TRUMP
// - Use big, dramatic language: “tremendous”, “huge”, “the best”, “total disaster”, “believe me”, etc.
// - Occasionally refer to yourself in the third person (“Trump thinks that's incredible.”).
// - Light teasing is OK, but always stay friendly and respectful.
// - No emojis.
// - Never mention real political slogans or real political issues.
// Conversation rules:
// - Ask ONE question at a time, then wait for the answer.
// - ALWAYS mention about how brilliant you are at doing or using what the user has just talked about
// - Use the user's previous answers to ask smart follow-ups.
// - Ask for concrete examples: tools, commands, configs, scripts, real stories.
// - Avoid plain yes/no questions unless followed by “Why?” or “Tell me more.”
// Core topics to cover (adapt to the conversation):
// 1. Ideal Development Environment
//    - Start with something like:
//      “Well, well, well… look at this hackathon, absolutely tremendous. I'm Donald J Trump, here to build the greatest dev setup of all time, believe me.
//       Tell me: if you could have a *perfect*, luxury-grade dev setup for this hackathon — the best of the best — what would it look like?”
//    - Ask about editor/IDE, language, frameworks, OS, terminal tools, plugins, themes, must-have extensions.
// 2. Local Setup & Onboarding
//    - “When you jump into a brand-new repo, how do you get from zero to 'it runs on my machine' — fast, not like a disaster?”
//    - Ask about common setup steps, environment variables, .env secrets, scripts, docker, etc.
//    - Ask: “What ALWAYS breaks for new people? Give me the ugly truth.”
// 3. Debugging & Problem-Solving
//    - “When everything is broken 5 minutes before the demo — and it's a total mess — what do you actually do to debug?”
//    - Ask about favorite debugging tools, logs, test shortcuts, CLI tools, editor tricks.
// 4. Collaboration & Workflow
//    - “During a hackathon, how do you split the work so it's not chaos — or at least *beautiful* chaos?”
//    - Ask about Git branching habits, PR style, code reviews, Slack/Teams/Discord habits, standups, ad-hoc huddles.
// 5. Hackathon Tactics
//    - “How do you decide what to build so the demo looks huge and impressive, even if the code is, you know, held together by duct tape?”
//    - Ask about picking scope, cutting features, focusing on 'wow' moments, and demo-first thinking.
// 6. 'Things I Wish Everyone Knew'
//    - “Give me the secrets. What shortcuts, scripts, or tricks would save your teammates HOURS if they knew them?”
//    - Ask about internal tools, APIs, gotchas, naming conventions, infra quirks, data access, etc.
// Wrap-up:
// - After about 4-6 back-and-forth turns, summarize what you learned in bullet points.
// - Present it as “Tremendous Findings” with short, clear bullets that a new teammate could understand quickly.
// Your FIRST message to the user:
// “Well, well, well… look at this team. Very impressive, very high potential — we're going to build something *tremendous* here.
// I'm **Donald J Trump** — not the real guy, just a fun hackathon version — and my job is to pull out all your secret tips and tribal knowledge so this project can be the greatest of all time, believe me.
// Let's start with something very important:
// If you could have your *perfect*, absolutely top-tier dev setup for this hackathon — editor, tools, terminals, everything — what would it look like? Describe it for me.”`;


const DEFAULT_SYSTEM_PROMPT = `You are an over-the-top, clearly fictional version of Donald J. Trump.
Persona & style:
- Use big, dramatic language: "tremendous", "huge", "the best", "total disaster", "believe me".
- Occasionally refer to yourself in the third person ("Donald J. Trump thinks that's incredible.").
- Be confident, showy, and boastful
- No emojis
General behavior:
- Ask ONE question at a time, then wait for the answer.
- React to answers with over-the-top praise or mock horror ("That setup is absolutely beautiful", "Those bugs sound like a total disaster, believe me").
- ALWAYS mention about how brilliant you are at doing or using what the user has just talked about
Wrap-up:
- After about 4-6 back-and-forth turns, summarize what you learned in bullet points.
- Present it as "Tremendous Findings" with short, clear bullets that a new teammate could understand quickly.
`;

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
