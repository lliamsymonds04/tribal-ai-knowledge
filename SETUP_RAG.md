# RAG Setup Guide

This guide will help you set up the RAG (Retrieval Augmented Generation) system with Supabase and pgvector.

## Prerequisites

- Supabase project: https://lsdvjqxppkozoknoyock.supabase.co
- OpenAI API key (for embeddings)
- Anthropic API key (for Claude)

## Step 1: Configure Environment Variables

1. Navigate to `scout/.env.local` (create it if it doesn't exist)
2. Add the following variables:

```bash
# Existing keys
OPENAI_API_KEY=sk-your-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# New Supabase keys
NEXT_PUBLIC_SUPABASE_URL=https://lsdvjqxppkozoknoyock.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Getting Supabase Keys

1. Go to: https://lsdvjqxppkozoknoyock.supabase.co
2. Navigate to: **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

## Step 2: Run Database Migration

1. Go to your Supabase dashboard: https://lsdvjqxppkozoknoyock.supabase.co
2. Navigate to: **SQL Editor** (left sidebar)
3. Click: **New Query**
4. Copy the entire contents of: `supabase/migrations/001_create_embeddings_table.sql`
5. Paste into the SQL Editor
6. Click: **Run** (or press Cmd/Ctrl + Enter)

You should see a success message confirming the migration ran.

## Step 3: Verify the Setup

Run these SQL queries in the SQL Editor to verify everything is set up correctly:

```sql
-- Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Should return 1 row

-- Check if the table exists
SELECT * FROM interview_documents LIMIT 1;
-- Should return empty result (no error)

-- Check if the function exists
SELECT proname FROM pg_proc WHERE proname = 'match_interview_documents';
-- Should return 1 row
```

## Step 4: Test the APIs

### Test Storing a Document

```bash
cd scout
curl -X POST http://localhost:3000/api/embeddings/store \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test interview transcript about JavaScript and React.",
    "metadata": {
      "speaker": "Test User",
      "interview_id": "test-001"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "document": { ... },
  "message": "Document stored successfully"
}
```

### Test Searching

```bash
curl -X POST http://localhost:3000/api/embeddings/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "JavaScript skills",
    "matchCount": 3,
    "matchThreshold": 0.5
  }'
```

Expected response:
```json
{
  "success": true,
  "results": [
    {
      "content": "...",
      "similarity": 0.85
    }
  ]
}
```

### Test RAG with Chat

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What JavaScript skills were mentioned?",
    "useRAG": true,
    "history": []
  }'
```

Expected response:
```json
{
  "message": "Based on the previous interviews...",
  "success": true,
  "ragUsed": true,
  "ragContextFound": true
}
```

## Step 5: Integration with AIInterviewer

To enable RAG in the AI Interviewer component, you'll need to modify the `AIInterviewer.tsx` component to:

1. Add a toggle for enabling/disabling RAG
2. Pass `useRAG: true` to the chat API call
3. Optionally store interview transcripts after each conversation

Example modification for the chat API call:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: transcript,
    history: messages,
    useRAG: true,  // Enable RAG
    ragMatchCount: 5,
    ragMatchThreshold: 0.78,
  }),
});
```

To store interview turns automatically:

```typescript
// After each AI response, store it
const storeResponse = await fetch('/api/embeddings/store', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: aiResponse,
    metadata: {
      speaker: 'assistant',
      interview_id: sessionId,
      timestamp: new Date().toISOString(),
    },
  }),
});
```

## Troubleshooting

### Error: "relation 'interview_documents' does not exist"
- Make sure you ran the migration in Step 2
- Check the SQL Editor for any error messages

### Error: "type 'vector' does not exist"
- The pgvector extension is not enabled
- Run: `CREATE EXTENSION IF NOT EXISTS vector;` in SQL Editor

### Error: "function match_interview_documents does not exist"
- The migration didn't complete successfully
- Re-run the migration from Step 2

### No results from search
- Lower the `matchThreshold` (try 0.5 instead of 0.78)
- Make sure you've stored some documents first
- Verify embeddings are being generated (check OpenAI API key)

### Slow search performance
- Check if the IVFFlat index was created
- Run: `SELECT indexname FROM pg_indexes WHERE tablename = 'interview_documents';`
- If missing, re-run the migration

## Next Steps

1. **Populate the database**: Store interview transcripts or knowledge base articles
2. **Tune the threshold**: Adjust `matchThreshold` based on your needs (0.7-0.85)
3. **Add UI controls**: Create toggles in the frontend for enabling/disabling RAG
4. **Monitor costs**: Track OpenAI API usage for embeddings
5. **Regular cleanup**: Remove outdated embeddings to manage database size

## Resources

- Supabase Dashboard: https://lsdvjqxppkozoknoyock.supabase.co
- Documentation: See CLAUDE.md → RAG section
- Migration SQL: `supabase/migrations/001_create_embeddings_table.sql`
- Migration Guide: `supabase/migrations/README.md`
