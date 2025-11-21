# Tribal AI Knowledge - Project Specification

## Executive Summary

Tribal AI Knowledge is an intelligent system designed to capture, organize, and democratize organizational knowledge through AI-powered voice interviews with employees. The platform uses Retrieval Augmented Generation (RAG) to transform conversational interviews into a searchable knowledge base that can be queried through a natural chat interface.

**🏆 HACKATHON PROJECT - 1 DAY BUILD**

## Problem Statement

Organizations lose critical knowledge when:
- Employees leave or transition roles
- Processes and workflows are undocumented
- Expertise exists in silos across teams
- Documentation is outdated or incomplete

Traditional documentation is time-consuming and often ignored. This system makes knowledge capture effortless through conversational interviews.

## Hackathon Strategy

### Time Constraint: 24 Hours (or less)

This project is designed to be built during a hackathon. The focus is on creating a **working MVP demo** that showcases the core concept with minimal but impressive features.

### What to Build (Priority Order)
1. **Must Have** - Core demo functionality
   - Voice recording interface
   - Transcription (Whisper API)
   - Simple RAG chat interface
   - Basic data storage

2. **Should Have** - Impressive features
   - Real-time transcription display
   - Source attribution in responses
   - Simple UI with good UX

3. **Nice to Have** - Polish
   - Multiple interviews support
   - Basic styling/branding
   - Demo data pre-loaded

### What to Skip (Post-Hackathon)
- User authentication (use mock user)
- Complex access controls
- Entity extraction
- Knowledge graph visualization
- Verification workflows
- Analytics dashboard
- Production deployment considerations

### Tech Stack Simplified (Fast Setup)
- **Frontend**: Vite + React (fastest setup) or Next.js if familiar
- **Backend**: Python FastAPI (simple, great for AI/ML)
- **Database**: SQLite + JSON files (no setup time) or Supabase (instant backend)
- **Vector Store**: In-memory FAISS or Chroma (local, no API keys needed initially)
- **AI Services**: OpenAI API (Whisper + GPT-4 + Embeddings) - single provider
- **Hosting**: Local demo first, Vercel/Railway if time permits

### Pre-Hackathon Checklist
- [ ] OpenAI API key obtained and tested
- [ ] Development environment set up
- [ ] Voice recording tested in browser
- [ ] Sample data prepared for testing
- [ ] Team roles assigned (if team hackathon)

### Quick Start Commands

```bash
# Backend setup (Python FastAPI)
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install fastapi uvicorn openai python-multipart chromadb

# Frontend setup (Vite + React)
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios

# Environment variables
echo "OPENAI_API_KEY=your_key_here" > backend/.env

# Run (in separate terminals)
cd backend && uvicorn main:app --reload
cd frontend && npm run dev
```

### Minimum File Structure
```
tribal-knowledge/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # Data models
│   ├── rag_service.py       # RAG logic
│   ├── requirements.txt     # Python deps
│   └── .env                 # API keys
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app
│   │   ├── RecordInterview.jsx
│   │   └── ChatInterface.jsx
│   └── package.json
└── PROJECT_SPEC.md          # This file
```

## Core Features (Hackathon Scope)

### 1. Voice Interview System ✅ Must Have
- **Audio Recording**: Capture employee interviews through web-based voice recording
- **Transcription**: Convert speech to text using OpenAI Whisper
- **Save Interview**: Store transcript and metadata in database

*Out of Scope for Hackathon:*
- ~~Guided Conversations (AI interviewer)~~
- ~~Topic Detection~~
- ~~Multi-session interviews~~

### 2. Knowledge Processing Pipeline ✅ Must Have
- **Semantic Chunking**: Break knowledge into meaningful, retrievable segments (simple 500-char chunks)
- **Vector Embeddings**: Generate embeddings for semantic search using OpenAI
- **Storage**: Save chunks and embeddings to vector database (Chroma/FAISS)

*Out of Scope for Hackathon:*
- ~~Entity Extraction~~
- ~~Complex metadata enrichment~~
- ~~Insight synthesis~~

### 3. RAG-Powered Chat Interface ✅ Must Have
- **Natural Language Queries**: Ask questions in plain English
- **Semantic Search**: Find relevant knowledge chunks using vector similarity
- **Context-Aware Responses**: AI retrieves relevant knowledge and generates accurate answers
- **Source Attribution**: Show which interviews provided the information

*Out of Scope for Hackathon:*
- ~~Confidence indicators~~
- ~~Follow-up suggestions~~
- ~~Multi-turn conversation memory~~

### 4. Knowledge Management ⚠️ Minimal
- **Interview List**: View conducted interviews
- **Basic Browse**: Click through to see full transcripts

*Out of Scope for Hackathon:*
- ~~Advanced search~~
- ~~Knowledge Graph~~
- ~~Verification Workflow~~
- ~~Version Control~~
- ~~Access Control~~

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  - Voice Recording UI                                    │
│  - Chat Interface                                        │
│  - Knowledge Browser                                     │
│  - Admin Dashboard                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│  - Authentication                                        │
│  - Rate Limiting                                         │
│  - Request Routing                                       │
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Interview Service  │     │    Chat Service     │
│  - Voice capture    │     │  - Query processing │
│  - Transcription    │     │  - RAG pipeline     │
│  - AI interviewer   │     │  - Response gen     │
└─────────────────────┘     └─────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────┐
│              Knowledge Processing Service                │
│  - Text processing                                       │
│  - Entity extraction                                     │
│  - Embedding generation                                  │
│  - Chunk management                                      │
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Vector Database    │     │  Primary Database   │
│  - Embeddings       │     │  - Interviews       │
│  - Semantic search  │     │  - Users            │
│  (Pinecone/Qdrant)  │     │  - Metadata         │
└─────────────────────┘     └─────────────────────┘
```

### Technology Stack Recommendations

#### Frontend
- **Framework**: Next.js 14+ (React with App Router)
- **UI Library**: shadcn/ui with Tailwind CSS
- **State Management**: React Query + Zustand
- **Voice Recording**: Web Audio API / MediaRecorder API
- **Real-time Updates**: WebSockets or Server-Sent Events

#### Backend
- **Runtime**: Node.js with TypeScript or Python with FastAPI
- **API Framework**: Express.js / Fastify (Node) or FastAPI (Python)
- **Authentication**: NextAuth.js or Auth0
- **Background Jobs**: Bull/BullMQ (Node) or Celery (Python)

#### AI/ML Services
- **Speech-to-Text**: OpenAI Whisper API, AssemblyAI, or Deepgram
- **LLM**: OpenAI GPT-4, Anthropic Claude, or open-source (Llama 3)
- **Embeddings**: OpenAI text-embedding-3, Cohere, or Sentence Transformers
- **RAG Framework**: LangChain or LlamaIndex

#### Databases
- **Primary DB**: PostgreSQL (relational data, interviews, users)
- **Vector DB**: Pinecone, Qdrant, Weaviate, or pgvector (PostgreSQL extension)
- **Cache**: Redis (session management, rate limiting)
- **File Storage**: AWS S3, Google Cloud Storage, or MinIO

#### Infrastructure
- **Hosting**: Vercel (frontend), AWS/GCP/Azure (backend)
- **Containerization**: Docker
- **Orchestration**: Kubernetes (for scale) or Docker Compose (dev)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, DataDog, or Grafana

## Data Models

### Core Entities

#### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  role: string;
  expertise_areas: string[];
  created_at: timestamp;
  last_active: timestamp;
}
```

#### Interview
```typescript
interface Interview {
  id: string;
  interviewee_id: string;
  interviewer_id: string | null; // null if AI interviewer
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'reviewed';
  audio_url: string;
  transcript: string;
  duration_seconds: number;
  topics: string[];
  metadata: {
    department: string;
    project: string | null;
    confidence_score: number;
  };
  created_at: timestamp;
  completed_at: timestamp | null;
}
```

#### KnowledgeChunk
```typescript
interface KnowledgeChunk {
  id: string;
  interview_id: string;
  content: string;
  embedding_vector: number[]; // stored in vector DB
  chunk_index: number;
  metadata: {
    topics: string[];
    entities: Entity[];
    start_time: number; // timestamp in audio
    end_time: number;
    confidence: number;
  };
  verified: boolean;
  verified_by: string | null;
  created_at: timestamp;
}
```

#### Entity
```typescript
interface Entity {
  id: string;
  name: string;
  type: 'person' | 'process' | 'tool' | 'concept' | 'location';
  description: string;
  related_entities: string[]; // entity IDs
  mentions: {
    chunk_id: string;
    context: string;
  }[];
  created_at: timestamp;
}
```

#### ChatSession
```typescript
interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: Message[];
  created_at: timestamp;
  updated_at: timestamp;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: {
    chunk_id: string;
    interview_id: string;
    relevance_score: number;
  }[];
  timestamp: timestamp;
}
```

## User Flows

### Flow 1: Conducting an Interview

1. User logs in and navigates to "New Interview"
2. Fills in basic info (title, topics, project context)
3. Clicks "Start Interview" - microphone access requested
4. AI asks opening question based on context
5. User responds verbally
6. System transcribes in real-time, displays on screen
7. AI asks follow-up questions based on responses
8. User can pause/resume or end interview
9. On completion, system processes transcript
10. User reviews transcript, can make corrections
11. Interview marked as complete, knowledge added to database

### Flow 2: Querying Knowledge

1. User opens chat interface
2. Types question: "How do we handle customer escalations?"
3. System:
   - Generates embedding for query
   - Searches vector DB for relevant chunks
   - Retrieves top matches with context
   - Sends to LLM with RAG prompt
4. Response displayed with:
   - AI-generated answer
   - Source interviews linked
   - Confidence score
   - Related questions
5. User can click through to original interview
6. User continues conversation with follow-ups

### Flow 3: Knowledge Review

1. Subject matter expert receives notification
2. Reviews new knowledge chunks in their domain
3. Can mark as verified, suggest edits, or flag as inaccurate
4. Changes update the knowledge base
5. Future queries reflect verified status

## Hackathon Development Timeline (1 Day)

### Hour 0-2: Project Setup & Infrastructure
**Goal**: Get everything running locally

- [ ] Initialize repositories (frontend + backend)
- [ ] Set up FastAPI backend with basic endpoints
- [ ] Set up React frontend with Vite
- [ ] Test OpenAI API connection (Whisper, GPT-4, Embeddings)
- [ ] Create basic data models (Interview, Message)
- [ ] Set up SQLite database or JSON file storage
- [ ] Initialize FAISS or Chroma vector store

**Checkpoint**: Server running, can make API calls to OpenAI

### Hour 2-6: Core Interview Recording System
**Goal**: Record audio and get transcriptions

- [ ] Build voice recording UI component
- [ ] Implement browser MediaRecorder API
- [ ] Create endpoint to upload audio files
- [ ] Integrate OpenAI Whisper for transcription
- [ ] Display transcript in real-time
- [ ] Save interview + transcript to database
- [ ] Basic error handling

**Checkpoint**: Can record voice, get transcript, save to database

### Hour 6-12: RAG Pipeline Implementation
**Goal**: Make the knowledge queryable

- [ ] Implement text chunking logic (simple 500-char chunks)
- [ ] Generate embeddings for transcript chunks
- [ ] Store embeddings in vector database
- [ ] Create chat API endpoint
- [ ] Implement semantic search (query -> embeddings -> retrieve chunks)
- [ ] Build RAG prompt template
- [ ] Integrate with GPT-4 for response generation
- [ ] Return responses with source attribution

**Checkpoint**: Can ask questions and get answers from interviews

### Hour 12-18: Frontend Chat Interface
**Goal**: Beautiful, functional UI

- [ ] Build chat interface component
- [ ] Message list with user/assistant styling
- [ ] Input field with send button
- [ ] Display source attribution (which interview, timestamp)
- [ ] Show multiple interviews in sidebar
- [ ] Add loading states and animations
- [ ] Basic responsive design
- [ ] Error handling in UI

**Checkpoint**: Full user flow works end-to-end

### Hour 18-22: Polish & Demo Prep
**Goal**: Make it impressive

- [ ] Add styling and branding
- [ ] Create 3-5 sample interviews (pre-recorded or generated)
- [ ] Add welcome screen with instructions
- [ ] Improve loading states and transitions
- [ ] Add "confidence" or "relevance" indicators
- [ ] Test all features thoroughly
- [ ] Fix critical bugs
- [ ] Prepare demo script

**Checkpoint**: Demo-ready application

### Hour 22-24: Presentation & Buffer
**Goal**: Nail the pitch

- [ ] Create pitch deck (3-5 slides)
- [ ] Record demo video (backup if live demo fails)
- [ ] Practice demo walkthrough
- [ ] Prepare for Q&A
- [ ] Deploy to Vercel/Railway (optional)
- [ ] Buffer time for unexpected issues

**Demo Success Criteria:**
- Record a live interview during demo
- Show transcript appearing in real-time
- Ask 3-5 questions to the AI
- Get accurate answers with source attribution
- Explain the value proposition clearly

### Contingency Plans

**If Behind Schedule:**
- Skip real-time transcription (upload audio instead)
- Use pre-recorded interviews only
- Simplify UI (basic HTML/CSS)
- Skip deployment (local demo only)

**If Ahead of Schedule:**
- Add AI interviewer (AI asks follow-up questions)
- Implement conversation history
- Add export functionality (PDF/Markdown)
- Create knowledge graph visualization
- Deploy to production

## Hackathon Demo Script

### 3-Minute Pitch Structure

**1. Hook (30 seconds)**
> "What happens when your best engineer quits? Your most experienced support agent retires? Your tribal knowledge walks out the door. Today, we're solving that with AI."

**2. Problem (30 seconds)**
- Organizations lose millions in knowledge when employees leave
- Documentation is time-consuming and outdated
- Critical processes exist only in people's heads
- New employees take months to ramp up

**3. Solution (60 seconds - LIVE DEMO)**
- **Part 1**: Record a 1-minute interview about a process
- Show real-time transcription appearing
- "This took 60 seconds. No forms, no documentation overhead."

**4. Value Prop (30 seconds - LIVE DEMO)**
- **Part 2**: Ask the AI: "How do I handle customer escalations?"
- Show instant response with source attribution
- "Now this knowledge is instantly accessible to everyone."

**5. Market & Traction (30 seconds)**
- Applicable to any organization with 50+ employees
- Works for onboarding, training, compliance, operations
- Future: Integration with Slack, Teams, etc.

### Demo Tips
- **Have backup**: Pre-recorded video in case live demo fails
- **Use real scenarios**: Don't fake the interview content
- **Show the source**: Emphasize traceability and trust
- **Keep it simple**: Don't over-explain the tech
- **End with vision**: "Imagine capturing 10 years of expertise in 10 hours of interviews"

## Security & Privacy Considerations (Post-Hackathon)

For the hackathon, security is simplified:
- Local storage only
- No real user data
- Demo/test data only

For production:
- **Data Encryption**: At rest and in transit (TLS/SSL)
- **Access Control**: RBAC with department-level permissions
- **PII Protection**: Automatic detection and redaction of sensitive info
- **Audit Logs**: Track all access to sensitive knowledge
- **Compliance**: GDPR, SOC 2 considerations
- **Data Retention**: Configurable policies for interview deletion
- **Anonymous Mode**: Option to anonymize contributor identity

## Hackathon Success Metrics

### Judging Criteria Focus
- **Innovation**: Novel approach to knowledge capture vs traditional documentation
- **Technical Achievement**: Working RAG pipeline, voice-to-knowledge flow
- **User Experience**: Clean UI, smooth interactions
- **Business Viability**: Clear market need and monetization path
- **Presentation**: Clear demo, compelling pitch

### Demo Success Checklist
- [ ] Live voice recording works
- [ ] Transcription appears (even if not real-time)
- [ ] Can ask 3+ different questions
- [ ] Answers are relevant and accurate
- [ ] Source attribution is visible
- [ ] No major bugs during demo
- [ ] Clear value proposition communicated
- [ ] Judges understand the technology

### Stretch Goals for Bonus Points
- [ ] Multiple interviews demonstrate knowledge synthesis
- [ ] Beautiful UI that looks production-ready
- [ ] Novel feature (AI interviewer, knowledge graph, etc.)
- [ ] Deployed live (accessible via URL)
- [ ] Mobile responsive design

## Post-Hackathon Roadmap

These features are beyond the scope of the 1-day build but represent the product vision:

### V2 Features (Week 1-2 post-hackathon)
- User authentication and multi-tenancy
- Real AI interviewer (asks dynamic follow-up questions)
- Improved RAG with re-ranking
- Interview management (edit, delete, search)
- Production deployment

### V3 Features (Month 1-3)
- **Multi-language Support**: Interviews and queries in multiple languages
- **Video Interviews**: Capture screen shares and demos
- **Integration Hub**: Connect with Slack, Teams, Confluence
- **Knowledge Graph**: Visualize connections between concepts
- **Advanced Analytics**: Usage stats, knowledge coverage
- **Verification Workflow**: SME review process

### V4 Features (Strategic/Long-term)
- **Automated Scheduling**: System suggests who to interview based on gaps
- **Knowledge Decay Detection**: Identify outdated information
- **Expert Recommendation**: Find the right person to talk to
- **Mobile App**: Conduct interviews on-the-go
- **Smart Summarization**: Generate knowledge base documentation automatically
- **Enterprise Features**: SSO, advanced security, audit logs

## Appendix: RAG Pipeline Details

### Retrieval Strategy
1. **Query Processing**: Clean and expand user query
2. **Embedding**: Generate vector for query
3. **Hybrid Search**: Combine vector similarity + keyword matching
4. **Re-ranking**: Use cross-encoder to re-score results
5. **Context Assembly**: Gather top-k chunks with surrounding context
6. **Prompt Engineering**: Format context for LLM

### Chunking Strategy
- **Method**: Semantic chunking (sentence + paragraph boundaries)
- **Size**: 200-400 tokens per chunk
- **Overlap**: 50 tokens between chunks
- **Metadata**: Preserve speaker, timestamp, topic tags

### Prompt Template
```
You are an AI assistant helping employees find information from organizational knowledge.

Context from interviews:
{retrieved_chunks}

User question: {query}

Provide a clear, accurate answer based on the context above. If the information isn't available, say so. Always cite your sources by mentioning which employee or interview the information came from.
```

---

**Document Version**: 2.0 (Hackathon Edition)
**Last Updated**: 2025-11-21
**Status**: Hackathon Ready
**Timeline**: 1 Day (24 hours)
**Target**: MVP Demo for Judging
