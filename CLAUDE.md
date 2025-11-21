# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scout - A Next.js application for Tribal AI Knowledge platform.

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **Linting**: ESLint with Next.js configuration

## Development Commands

```bash
npm run dev    # Start development server (http://localhost:3000)
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
scout/
├── src/           # Source code
│   ├── app/       # Next.js App Router pages and layouts
│   └── ...
├── public/        # Static assets
├── node_modules/  # Dependencies
└── ...
```

## API Routes (Vercel Deployment)

API routes are created using Next.js Route Handlers in the App Router:

- **Location**: `scout/src/app/api/[route-name]/route.ts`
- **HTTP Methods**: Export named functions (GET, POST, PUT, DELETE, PATCH)
- **Response**: Use `NextResponse` from `next/server`
- **Deployment**: Automatically deployed as serverless functions on Vercel

### Example Route Structure

```typescript
// scout/src/app/api/example/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ data: 'value' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### Vercel Specifics

- Each route automatically becomes a serverless function
- Default region: Auto-selected based on deployment
- Function timeout: 10s (Hobby), 60s (Pro)
- No additional configuration needed for basic API routes
- Environment variables accessible via `process.env`

## Audio Transcription (OpenAI Whisper)

The application includes audio recording and transcription functionality using OpenAI's Whisper model.

### Architecture

**Flow**: User records audio → Frontend sends to API → API calls OpenAI Whisper → Returns transcription

### Components

1. **AudioRecorder Component** (`scout/src/components/AudioRecorder.tsx`)
   - Client-side React component using MediaRecorder API
   - Records audio from user's microphone
   - Displays recording status, timer, and transcription results
   - Handles errors (permissions, file size, API failures)

2. **Transcription API** (`scout/src/app/api/transcribe/route.ts`)
   - Accepts POST requests with audio file (multipart/form-data)
   - Validates file size (25MB limit) and format
   - Forwards to OpenAI Whisper API
   - Returns transcribed text as JSON

### Configuration

**Required Environment Variable**:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

Add this to `.env.local` (see `.env.local.example` for reference)

### Supported Audio Formats

- WebM (Chrome/Firefox default)
- MP3, MP4, MPEG, MPGA, M4A, WAV

### Limitations & Costs

- Maximum file size: 25MB (OpenAI limit)
- Cost: ~$0.006 per minute of audio
- Processing time: Usually 2-10 seconds depending on audio length

### Usage

```tsx
import AudioRecorder from '@/components/AudioRecorder';

export default function Page() {
  return <AudioRecorder />;
}
```

## AI Interviewer (LangChain + Claude)

The application features an AI interviewer powered by Claude via LangChain, with full conversation history and voice input.

### Architecture

**Flow**: User speaks → Audio transcribed → Sent to Claude with history → AI responds → Display + repeat

### Tech Stack

- **LangChain**: Framework for building LLM applications
  - `@langchain/anthropic`: Claude integration
  - `@langchain/core`: Core abstractions (messages, prompts)
- **Claude Model**: claude-3-5-sonnet-20240620
- **Conversation Memory**: Full history maintained in component state

### Components

1. **AIInterviewer Component** (`scout/src/components/AIInterviewer.tsx`)
   - Combines audio recording with conversational AI
   - Maintains full conversation history
   - Auto-scrolling chat interface
   - States: idle → recording → transcribing → processing → idle
   - Initializes with AI greeting on mount

2. **Chat API** (`scout/src/app/api/chat/route.ts`)
   - Accepts POST with message and conversation history
   - Uses LangChain's ChatAnthropic for Claude integration
   - Converts messages to LangChain format (HumanMessage, AIMessage, SystemMessage)
   - Returns AI response as JSON
   - Supports custom system prompts

### Configuration

**Required Environment Variables**:
```bash
OPENAI_API_KEY=sk-your-api-key-here          # For Whisper transcription
ANTHROPIC_API_KEY=sk-ant-your-api-key-here   # For Claude via LangChain
```

Add these to `.env.local` (see `.env.local.example` for reference)

### System Prompt

The default system prompt configures Claude as an empathetic interviewer. You can customize it by passing a `systemPrompt` parameter to the chat API:

```typescript
// Custom system prompt example
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello',
    history: [],
    systemPrompt: 'You are a technical interviewer specializing in software engineering...'
  }),
});
```

### Conversation Flow

1. User clicks "Start Speaking" → Microphone activates
2. User speaks → Timer shows recording duration
3. User clicks "Stop Speaking" → Audio processing begins
4. Audio transcribed via Whisper API
5. Transcription sent to Claude with full conversation history
6. Claude's response displayed in chat
7. Repeat from step 1

### Usage

```tsx
import AIInterviewer from '@/components/AIInterviewer';

export default function InterviewPage() {
  return <AIInterviewer />;
}
```

### Costs & Limitations

**Audio Transcription**:
- ~$0.006 per minute (Whisper)
- 25MB max file size

**Claude API**:
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens
- Model: claude-3-5-sonnet-20240620

**Conversation History**: Full history sent with each request (token usage increases over time)

### Best Practices

- Keep interviews reasonably short to manage token costs
- Clear conversation history for new interview sessions
- Monitor API usage in Anthropic and OpenAI dashboards
- Consider implementing conversation summarization for very long interviews

## Development Workflow

- Uses Next.js App Router architecture
- TypeScript strict mode enabled
- Hot module reloading in development
- Auto-optimized fonts with next/font (Geist)
- Tailwind CSS for styling with v4 configuration

## Key Technical Decisions

- Next.js 16 with latest App Router for improved performance and developer experience
- React 19 for cutting-edge features
- Tailwind CSS v4 for modern utility-first styling
- TypeScript for type safety and better developer experience
