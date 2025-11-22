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
HUME_API_KEY=your-hume-api-key-here          # Optional: For TTS voice responses
HUME_VOICE_ID=your-voice-clone-id-here       # Optional: Your custom voice clone
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

## Text-to-Speech (Hume AI Octave)

The application includes text-to-speech functionality using Hume AI's Octave TTS model with custom voice cloning support.

### Architecture

**Flow**: AI generates response → Text sent to Hume API → Voice clone synthesizes speech → Audio returned and played

### Tech Stack

- **TTS Provider**: Hume AI Octave
- **API Endpoint**: `/v0/tts/file` (synchronous file response)
- **Voice**: Custom voice clone (created in Hume platform)
- **Audio Format**: MP3

### Components

1. **TTS API** (`scout/src/app/api/tts/route.ts`)
   - Accepts POST requests with text
   - Validates Hume API key and voice ID configuration
   - Calls Hume AI Octave TTS API with voice clone ID
   - Returns audio file as MP3
   - Optional voiceId parameter to override default voice

2. **AIInterviewer Component** (`scout/src/components/AIInterviewer.tsx`)
   - Automatically calls TTS API for AI responses
   - Plays audio using Web Audio API
   - Shows speaking indicator during playback
   - Stop button to interrupt audio playback

### Configuration

**Required Environment Variables**:
```bash
HUME_API_KEY=your-hume-api-key-here          # From https://platform.hume.ai/settings/keys
HUME_VOICE_ID=your-voice-clone-id-here       # From https://platform.hume.ai/voice
```

Add these to `.env.local` (see `.env.local.example` for reference)

### Creating a Voice Clone

1. Visit [Hume AI Platform](https://platform.hume.ai/voice)
2. Click "Create Voice Clone"
3. Record at least 15 seconds of clear audio (or upload audio file)
4. Follow the guided recording session (typically <30 seconds total)
5. Copy the voice ID from the Voice Library
6. Add the voice ID to your `.env.local` as `HUME_VOICE_ID`

### API Request Format

```typescript
// Example TTS request
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, this is my custom voice clone speaking!',
    voiceId: 'optional-override-voice-id', // Optional: override default voice
  }),
});

// Returns audio/mpeg blob
const audioBlob = await response.blob();
```

### Hume API Details

The TTS API uses Hume's synchronous file endpoint with the following structure:

```json
{
  "version": "2",
  "utterances": [
    {
      "text": "Your text here",
      "voice": {
        "id": "your-voice-clone-id"
      }
    }
  ]
}
```

Authentication is done via the `X-Hume-Api-Key` header.

### Features

- **High-Quality Voice Cloning**: Create realistic voice clones with just 15 seconds of audio
- **Emotion-Aware Speech**: Octave understands context and delivers emotionally appropriate speech
- **Low Latency**: Fast synthesis for real-time conversational applications
- **Graceful Degradation**: If API key not configured, app continues to work without TTS

### Costs & Limitations

**Hume AI Octave TTS**:
- Pricing available at [Hume AI pricing page](https://www.hume.ai/pricing)
- Voice clones require initial recording session
- No per-minute charges for voice clone creation (one-time setup)

**Character Limits**:
- Maximum 5,000 characters per utterance
- Maximum 1,000 characters for voice descriptions (if using voice design)

### Best Practices

1. **Voice Clone Quality**: Use clear, high-quality audio for best voice cloning results
2. **Error Handling**: App gracefully handles missing API keys (disables TTS)
3. **Audio Playback**: Users can stop audio mid-playback with stop button
4. **Monitor Usage**: Track API usage in Hume AI dashboard
5. **Voice Selection**: Store voice ID in environment variables for consistency

### Troubleshooting

**TTS not working**:
- Verify `HUME_API_KEY` is set correctly in `.env.local`
- Verify `HUME_VOICE_ID` is set with valid voice clone ID
- Check API key permissions in Hume platform
- Check browser console for API error messages

**Poor voice quality**:
- Re-record voice clone with better audio quality
- Use quiet environment for voice clone recording
- Ensure 15+ seconds of clear, consistent speech

**Audio not playing**:
- Check browser audio permissions
- Verify audio format compatibility (MP3)
- Check network tab for failed API requests

## RAG (Retrieval Augmented Generation) with Supabase

The application implements RAG using Supabase with pgvector for semantic search over interview transcripts and knowledge base content.

### Architecture

**Flow**: Store documents with embeddings → User query → Generate query embedding → Semantic search → Retrieve relevant context → Augment AI prompt → Generate response

### Tech Stack

- **Database**: Supabase (PostgreSQL)
- **Vector Extension**: pgvector for similarity search
- **Embeddings Model**: OpenAI text-embedding-ada-002 (1536 dimensions)
- **Search Algorithm**: IVFFlat with cosine similarity

### Database Schema

The `interview_documents` table stores document embeddings:

```sql
create table interview_documents (
  id uuid primary key,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

**Indexes**:
- IVFFlat index on embeddings for fast similarity search
- GIN index on metadata for filtering

### Components

1. **Supabase Client** (`scout/src/lib/supabase.ts`)
   - Client for browser-side operations
   - Admin client with service role for server-side operations
   - TypeScript interfaces for database types

2. **Embedding Utilities** (`scout/src/lib/embeddings.ts`)
   - `generateEmbedding()`: Generate single embedding
   - `generateEmbeddings()`: Batch generate embeddings
   - `splitTextIntoChunks()`: Split long documents
   - `cosineSimilarity()`: Calculate similarity between vectors

3. **Store API** (`scout/src/app/api/embeddings/store/route.ts`)
   - POST: Store documents with embeddings
   - GET: Retrieve stored documents
   - DELETE: Remove documents
   - Supports automatic text chunking for long documents

4. **Search API** (`scout/src/app/api/embeddings/search/route.ts`)
   - POST/GET: Semantic search across documents
   - Returns most relevant documents with similarity scores
   - Supports metadata filtering

5. **Enhanced Chat API** (`scout/src/app/api/chat/route.ts`)
   - Integrated RAG support with `useRAG` parameter
   - Automatically retrieves relevant context
   - Augments system prompt with retrieved documents

### Configuration

**Required Environment Variables**:
```bash
OPENAI_API_KEY=sk-your-api-key-here                        # For embeddings & Whisper
ANTHROPIC_API_KEY=sk-ant-your-api-key-here                 # For Claude
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key                # Public key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key            # Admin key
```

Add these to `.env.local` (see `.env.local.example` for reference)

### Setting Up the Database

1. Run the migration in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase/migrations/001_create_embeddings_table.sql
   # Paste into SQL Editor at https://lsdvjqxppkozoknoyock.supabase.co
   # Click "Run"
   ```

2. Verify the migration:
   ```sql
   -- Check if pgvector extension is enabled
   SELECT * FROM pg_extension WHERE extname = 'vector';

   -- Check if table exists
   SELECT * FROM interview_documents LIMIT 1;
   ```

See `supabase/migrations/README.md` for detailed instructions.

### Usage Examples

#### Storing Documents

```typescript
// Store a single document
const response = await fetch('/api/embeddings/store', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Interview transcript or knowledge base content...',
    metadata: {
      speaker: 'John Doe',
      interview_id: 'interview-123',
      timestamp: new Date().toISOString(),
    },
  }),
});

// Store a long document (auto-chunked)
const response = await fetch('/api/embeddings/store', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Very long document...',
    splitIntoChunks: true,
    metadata: { document_type: 'transcript' },
  }),
});
```

#### Semantic Search

```typescript
// Search for relevant documents
const response = await fetch('/api/embeddings/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What are the candidate\'s technical skills?',
    matchThreshold: 0.78,  // Similarity threshold (0-1)
    matchCount: 5,         // Max results
    metadata: {            // Optional filtering
      interview_id: 'interview-123',
    },
  }),
});

// Response format
{
  success: true,
  results: [
    {
      id: 'uuid',
      content: 'Document content...',
      metadata: { ... },
      similarity: 0.92  // Cosine similarity score
    }
  ]
}
```

#### Using RAG with Chat API

```typescript
// Chat with RAG enabled
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What technical skills did the candidate mention?',
    history: [],
    useRAG: true,              // Enable RAG
    ragMatchCount: 5,          // Number of documents to retrieve
    ragMatchThreshold: 0.78,   // Similarity threshold
  }),
});

// Response includes RAG status
{
  message: 'Based on the interview...',
  success: true,
  ragUsed: true,
  ragContextFound: true
}
```

### Similarity Search Function

The database includes a custom `match_interview_documents` function for efficient similarity search:

```sql
SELECT * FROM match_interview_documents(
  query_embedding := '[0.1, 0.2, ...]'::vector,
  match_threshold := 0.78,
  match_count := 5
);
```

Returns documents sorted by similarity with scores.

### Costs & Considerations

**OpenAI Embeddings (text-embedding-ada-002)**:
- Cost: ~$0.0001 per 1,000 tokens
- Dimension: 1536
- Max input: 8,191 tokens per request

**Supabase**:
- Free tier: 500MB database, 2GB bandwidth
- Pro tier ($25/mo): 8GB database, 250GB bandwidth
- pgvector operations are fast but require adequate database resources

**Storage Estimates**:
- Average embedding: ~6KB per document
- 10,000 documents: ~60MB database storage

### Best Practices

1. **Chunking**: Split long documents (>8000 tokens) for better retrieval
2. **Metadata**: Use metadata for filtering and organization
3. **Threshold Tuning**: Adjust `matchThreshold` (0.7-0.85) based on precision needs
4. **Indexing**: Ensure IVFFlat index is created for performance
5. **Batch Operations**: Use `generateEmbeddings()` for bulk processing
6. **Monitor Costs**: Track OpenAI embedding API usage
7. **Regular Cleanup**: Remove outdated embeddings to manage database size

### Troubleshooting

**pgvector not enabled**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Slow searches**:
- Check if IVFFlat index exists
- Increase `lists` parameter in index creation
- Consider upgrading Supabase plan for more compute

**Low similarity scores**:
- Lower `matchThreshold` (try 0.5-0.7)
- Ensure embeddings are generated correctly
- Verify content quality and relevance

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
