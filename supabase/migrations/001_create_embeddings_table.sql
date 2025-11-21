-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table to store interview transcript embeddings
create table if not exists interview_documents (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(1536), -- OpenAI ada-002 embedding size
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for faster similarity searches
create index if not exists interview_documents_embedding_idx
  on interview_documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Create an index on metadata for faster filtering
create index if not exists interview_documents_metadata_idx
  on interview_documents
  using gin (metadata);

-- Create a function to search for similar documents
create or replace function match_interview_documents (
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    interview_documents.id,
    interview_documents.content,
    interview_documents.metadata,
    1 - (interview_documents.embedding <=> query_embedding) as similarity
  from interview_documents
  where 1 - (interview_documents.embedding <=> query_embedding) > match_threshold
  order by interview_documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create a function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update updated_at
create trigger update_interview_documents_updated_at
  before update on interview_documents
  for each row
  execute function update_updated_at_column();

-- Enable Row Level Security (optional, uncomment if needed)
-- alter table interview_documents enable row level security;

-- Create a policy to allow all operations (modify as needed for your security requirements)
-- create policy "Allow all operations for authenticated users" on interview_documents
--   for all
--   using (true)
--   with check (true);
