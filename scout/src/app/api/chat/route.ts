import { NextRequest, NextResponse } from 'next/server';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
});

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

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: Message[];
  systemPrompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history = [], systemPrompt = DEFAULT_SYSTEM_PROMPT } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert history to LangChain message format
    const messages = [];

    // Add system prompt
    messages.push(new SystemMessage(systemPrompt));

    // Add conversation history
    for (const msg of history) {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
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
    });

  } catch (error: any) {
    console.error('Chat error:', error);

    // Handle Anthropic API errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Anthropic API key' },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    );
  }
}
