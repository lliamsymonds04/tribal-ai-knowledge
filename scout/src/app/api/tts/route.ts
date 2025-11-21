import { NextRequest, NextResponse } from 'next/server';

// Eleven Labs API endpoint
const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Default voice ID (Rachel - a professional, clear voice)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

interface TTSRequest {
  text: string;
  voiceId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is provided
    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('ELEVENLABS_API_KEY not set, TTS disabled');
      return NextResponse.json(
        { error: 'TTS is not configured', available: false },
        { status: 200 } // Return 200 so it doesn't break the app
      );
    }

    const body: TTSRequest = await request.json();
    const { text, voiceId = DEFAULT_VOICE_ID } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Call Eleven Labs API
    const response = await fetch(`${ELEVEN_LABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Eleven Labs API error:', errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Eleven Labs API key' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate speech', details: errorData },
        { status: response.status }
      );
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    );
  }
}
