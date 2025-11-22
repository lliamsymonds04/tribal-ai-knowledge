import { NextRequest, NextResponse } from 'next/server';

// Hume AI Octave TTS API endpoint
const HUME_TTS_API_URL = 'https://api.hume.ai/v0/tts/file';

interface TTSRequest {
  text: string;
  voiceId?: string;
  speed?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is provided
    if (!process.env.HUME_API_KEY) {
      console.log('HUME_API_KEY not set, TTS disabled');
      return NextResponse.json(
        { error: 'TTS is not configured', available: false },
        { status: 200 } // Return 200 so it doesn't break the app
      );
    }

    // Check if voice ID is configured
    if (!process.env.HUME_VOICE_ID) {
      console.log('HUME_VOICE_ID not set, TTS disabled');
      return NextResponse.json(
        { error: 'Voice clone not configured', available: false },
        { status: 200 }
      );
    }

    const body: TTSRequest = await request.json();
    const { text, voiceId, speed } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Use custom voiceId if provided, otherwise use environment variable
    const selectedVoiceId = voiceId || process.env.HUME_VOICE_ID;

    // Default speed to 1.25x for faster speech (can be overridden)
    const selectedSpeed = speed !== undefined ? speed : 1.25;

    // Call Hume AI Octave TTS API
    const response = await fetch(HUME_TTS_API_URL, {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': process.env.HUME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '2',
        utterances: [
          {
            text: text,
            voice: {
              id: selectedVoiceId,
            },
            speed: selectedSpeed,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Hume AI API error:', errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Hume AI API key' },
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
