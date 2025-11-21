# Supabase Migrations

## Running Migrations

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard: https://lsdvjqxppkozoknoyock.supabase.co
2. Navigate to the SQL Editor tab
3. Copy the contents of `001_create_embeddings_table.sql`
4. Paste into the SQL Editor and click "Run"

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref lsdvjqxppkozoknoyock

# Run migrations
supabase db push
```

## What This Migration Does

1. Enables the `pgvector` extension for vector operations
2. Creates the `interview_documents` table with:
   - `id`: Unique identifier (UUID)
   - `content`: The text content to be embedded
   - `embedding`: Vector representation (1536 dimensions for OpenAI ada-002)
   - `metadata`: Flexible JSON field for storing additional info (speaker, timestamp, etc.)
   - `created_at` and `updated_at`: Timestamps

3. Creates indexes for:
   - Fast similarity searches using IVFFlat algorithm
   - Metadata filtering

4. Creates a `match_interview_documents` function for semantic search
5. Sets up automatic timestamp updates

## Verifying the Migration

After running the migration, verify it worked:

```sql
-- Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if table exists
SELECT * FROM interview_documents LIMIT 1;

-- Test the similarity search function
SELECT * FROM match_interview_documents(
  array_fill(0, ARRAY[1536])::vector,
  0.5,
  5
);
```
