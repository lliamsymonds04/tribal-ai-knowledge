import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateEmbedding, splitTextIntoChunks } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, metadata = {}, splitIntoChunks = false } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // If content should be split into chunks (for long documents)
    if (splitIntoChunks) {
      const chunks = splitTextIntoChunks(content);
      const results = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await generateEmbedding(chunk);

        const { data, error } = await supabaseAdmin
          .from('interview_documents')
          .insert({
            content: chunk,
            embedding,
            metadata: {
              ...metadata,
              chunk_index: i,
              total_chunks: chunks.length,
              is_chunked: true,
            },
          })
          .select()
          .single();

        if (error) {
          console.error('Error storing chunk:', error);
          throw error;
        }

        results.push(data);
      }

      return NextResponse.json({
        success: true,
        documents: results,
        message: `Successfully stored ${results.length} document chunks`,
      });
    }

    // Store as single document
    const embedding = await generateEmbedding(content);

    const { data, error } = await supabaseAdmin
      .from('interview_documents')
      .insert({
        content,
        embedding,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing document:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      document: data,
      message: 'Document stored successfully',
    });
  } catch (error) {
    console.error('Error in store endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to store document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { data, error, count } = await supabaseAdmin
      .from('interview_documents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      documents: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in get endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('interview_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
