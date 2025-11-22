'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import AudioRecorder from './AudioRecorder';
import AvatarDisplay from './AvatarDisplay';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIInterviewer() {
  const router = useRouter();

  // Check if TTS is enabled via environment variable
  const ttsEnabled = process.env.NEXT_PUBLIC_ENABLE_TTS === 'true';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [ttsAvailable, setTtsAvailable] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [initialGreeting, setInitialGreeting] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string>("");
  const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [audioAmplitude, setAudioAmplitude] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle error toast fade out
  useEffect(() => {
    if (error) {
      setIsErrorFadingOut(false);

      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Start fade out after 4 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setIsErrorFadingOut(true);

        // Remove error completely after fade out animation
        setTimeout(() => {
          setError("");
          setIsErrorFadingOut(false);
        }, 300);
      }, 4000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  // Fetch initial greeting when component mounts (but don't play TTS yet)
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Hello, I am ready to start the interview.',
            history: [],
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setInitialGreeting(data.message);
        }
      } catch (err) {
        console.error('Failed to fetch initial greeting:', err);
      }
    };

    fetchGreeting();
  }, []);

  // Auto-save when messages change
  useEffect(() => {
    // Only save if we have actual conversation (more than just greeting)
    if (messages.length > 1) {
      // Debounce: wait a bit before saving to avoid too many saves
      const timeoutId = setTimeout(() => {
        // Only save if not currently saving
        if (!isSaving) {
          saveToDatabase();
        }
      }, 2000); // 2 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [messages]); // Only depend on messages, not isSaving!

  const playTTS = async (text: string) => {
    if (!ttsAvailable) return;

    try {
      setIsPlayingAudio(true);

      // Call TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.available === false) {
          setTtsAvailable(false);
          console.log('TTS not available (API key not configured)');
        }
        return;
      }

      // Create audio from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Initialize Web Audio API for amplitude analysis
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Create analyzer node
      if (!analyzerRef.current) {
        analyzerRef.current = audioContext.createAnalyser();
        analyzerRef.current.fftSize = 256; // Smaller FFT for better performance
        analyzerRef.current.smoothingTimeConstant = 0.3; // Balanced smoothing
      }

      const analyzer = analyzerRef.current;

      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Connect audio to analyzer
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);

      // Start amplitude tracking
      const dataArray = new Uint8Array(analyzer.fftSize);

      const updateAmplitude = () => {
        if (!audioRef.current || audioRef.current.paused || audioRef.current.ended) {
          setAudioAmplitude(0);
          return;
        }

        analyzer.getByteTimeDomainData(dataArray);

        // Calculate RMS (Root Mean Square) for amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Apply smoothing and set amplitude (scaled to 0-1 range)
        setAudioAmplitude(prev => {
          const smoothingFactor = 0.3;
          return prev * (1 - smoothingFactor) + rms * smoothingFactor * 3; // *3 for better visual range
        });

        animationFrameRef.current = requestAnimationFrame(updateAmplitude);
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        setAudioAmplitude(0);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        setAudioAmplitude(0);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      updateAmplitude(); // Start amplitude tracking

    } catch (error) {
      console.error('TTS playback error:', error);
      setIsPlayingAudio(false);
      setAudioAmplitude(0);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      setAudioAmplitude(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleStartInterview = async () => {
    // Set interview as started
    setInterviewStarted(true);

    // Add initial greeting to messages
    if (initialGreeting) {
      setMessages([{
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date(),
      }]);

      // Play TTS for initial greeting (user interaction allows autoplay)
      if (ttsEnabled && ttsAvailable) {
        await playTTS(initialGreeting);
      }
    }
  };

  const handleUserMessage = async (messageText: string) => {
    try {
      setIsProcessing(true);

      // Add user message to history
      const userMessage: Message = {
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Send to Claude via LangChain
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const chatData = await chatResponse.json();

      if (!chatResponse.ok) {
        throw new Error(chatData.error || 'Failed to get response from AI');
      }

      // Add Trump's response to history
      const aiMessage: Message = {
        role: 'assistant',
        content: chatData.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Play TTS for Trump's response (if available and enabled)
      if (ttsEnabled && ttsAvailable) {
        await playTTS(chatData.message);
      }

    } catch (err: any) {
      console.error('Chat error:', err);
      // Error will be shown in a message format
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim() || isProcessing) return;

    handleUserMessage(textInput);
    setTextInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const downloadConversation = () => {
    if (messages.length === 0) {
      alert('No conversation to download yet!');
      return;
    }

    // Format conversation as text
    let conversationText = 'Trump Interview Transcript\n';
    conversationText += '='.repeat(50) + '\n';
    conversationText += `Date: ${new Date().toLocaleString()}\n`;
    conversationText += '='.repeat(50) + '\n\n';

    messages.forEach((msg, index) => {
      const speaker = msg.role === 'user' ? 'YOU' : 'TRUMP';
      const time = msg.timestamp.toLocaleTimeString();

      conversationText += `[${time}] ${speaker}:\n`;
      conversationText += `${msg.content}\n\n`;
    });

    // Create blob and download
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `interview-transcript-${dateStr}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveToDatabase = async () => {
    // Skip if no messages or only initial greeting or already saving
    if (messages.length <= 1 || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      // Format conversation as text
      let conversationText = 'Trump Interview Transcript\n';
      conversationText += '='.repeat(50) + '\n';
      conversationText += `Date: ${new Date().toLocaleString()}\n`;
      conversationText += '='.repeat(50) + '\n\n';

      messages.forEach((msg) => {
        const speaker = msg.role === 'user' ? 'YOU' : 'TRUMP';
        const time = msg.timestamp.toLocaleTimeString();
        conversationText += `[${time}] ${speaker}:\n${msg.content}\n\n`;
      });

      // Save to database with embeddings
      const response = await fetch('/api/embeddings/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: conversationText,
          splitIntoChunks: true, // Split long conversations into chunks
          metadata: {
            type: 'interview_transcript',
            date: new Date().toISOString(),
            message_count: messages.length,
            duration_minutes: Math.round(
              (messages[messages.length - 1].timestamp.getTime() -
               messages[0].timestamp.getTime()) / 60000
            ),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save conversation');
      }

      setLastSaved(new Date());
      console.log(`✅ Interview auto-saved: ${data.stored || 1} document(s) stored`);

    } catch (error: any) {
      console.error('❌ Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Show start screen if interview hasn't started
  if (!interviewStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-4xl mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 font-jetbrains">Scout</h1>
          <p className="text-xl text-gray-600 mb-8">Trump Interview Assistant</p>
          <p className="text-gray-500 mb-8 max-w-md">
            Click the button below to begin your interview. Trump will greet you and guide you through the conversation - it's going to be tremendous, believe me.
          </p>
        </div>
        <button
          onClick={handleStartInterview}
          disabled={!initialGreeting}
          className={`px-8 py-4 text-lg font-bold rounded-lg transition-all transform hover:scale-105 ${
            initialGreeting
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {initialGreeting ? 'Start Interview' : 'Loading...'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Error Toast */}
      {error && (
        <div
          className={`fixed top-8 left-1/2 -translate-x-1/2 w-auto max-w-md px-6 py-4 text-white rounded-lg bg-red-500 border border-red-700 shadow-lg z-50 ${
            isErrorFadingOut
              ? "animate-[fadeOut_0.3s_ease-out]"
              : "animate-[fadeIn_0.3s_ease-out]"
          }`}
        >
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="text-sm font-medium">{error}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-jetbrains">Scout</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">Speak or type your responses</p>
            {isSaving && (
              <span className="text-xs text-gray-500 flex items-center">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block mr-1" />
                Saving...
              </span>
            )}
            {!isSaving && lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          {isPlayingAudio && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm text-blue-600">Trump is speaking...</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {isPlayingAudio && (
            <button
              onClick={stopAudio}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              title="Stop audio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
              Stop
            </button>
          )}
          <button
            onClick={downloadConversation}
            disabled={messages.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${messages.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            title="Download conversation transcript"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
          <button
            onClick={() => router.push('/extractor')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            title="Ask Trump about saved knowledge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Extractor
          </button>
        </div>
      </div>

      {/* Avatar Display */}
      <div className="min-h-1/3 mb-4">
        <AvatarDisplay isSpeaking={isPlayingAudio} audioAmplitude={audioAmplitude} />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-primary rounded-lg p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`drop-shadow-lg drop-shadow-black/5 max-w-[70%] rounded-lg p-4 ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-secondary text-white border border-border'
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.role === 'user' ? 'You' : 'Trump'}
              </div>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-white">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                      pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded overflow-x-auto mb-2">{children}</pre>,
                      h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Trump is thinking... making it tremendous...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls */}
      <div className="bg-primary border-t border-border p-4 rounded-lg">
        <div className="flex items-center space-x-3">

          {/* Text Input */}
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Or type your message..."
            disabled={isProcessing}
            className="bg-tertiary flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
          {/* Voice Input */}
          <div className="shrink-0">
            <AudioRecorder
              onTranscriptionComplete={handleUserMessage}
              hideTranscription={true}
              showTitle={false}
              error={error}
              setError={setError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
