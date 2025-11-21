import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      matchThreshold = 0.78,
      matchCount = 5,
      metadata = {},
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Use the RPC function to find similar documents
    const { data, error } = await supabaseAdmin.rpc('match_interview_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('Error searching documents:', error);
      throw error;
    }

    // Filter by metadata if provided
    let results = data;
    if (metadata && Object.keys(metadata).length > 0) {
      results = data.filter((doc: { metadata: Record<string, unknown> }) => {
        return Object.entries(metadata).every(([key, value]) => {
          return doc.metadata[key] === value;
        });
      });
    }

    return NextResponse.json({
      success: true,
      results,
      query,
      matchCount: results.length,
    });
  } catch (error) {
    console.error('Error in search endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to search documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const matchThreshold = parseFloat(searchParams.get('matchThreshold') || '0.78');
    const matchCount = parseInt(searchParams.get('matchCount') || '5', 10);

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Use the RPC function to find similar documents
    const { data, error } = await supabaseAdmin.rpc('match_interview_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('Error searching documents:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      results: data,
      query,
      matchCount: data.length,
    });
  } catch (error) {
    console.error('Error in search endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to search documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
