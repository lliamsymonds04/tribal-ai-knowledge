'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import AudioRecorder from './AudioRecorder';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  ragUsed?: boolean;
  ragContextFound?: boolean;
}

export default function KnowledgeExtractor() {
  const router = useRouter();

  // Check if TTS is enabled via environment variable
  const ttsEnabled = process.env.NEXT_PUBLIC_ENABLE_TTS === 'true';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [ragMatchThreshold, setRagMatchThreshold] = useState<number>(0.65);
  const [ragMatchCount, setRagMatchCount] = useState<number>(5);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [ttsAvailable, setTtsAvailable] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial greeting when component mounts
  useEffect(() => {
    const systemMessage: Message = {
      role: 'system',
      content: '**Scout Knowledge Search** - I\'m here to explain your organizational knowledge - and nobody, I mean NOBODY, explains things better than me, believe me. Ask me about processes, client knowledge, troubleshooting, anything from our tremendous database. It\'s going to be huge.',
      timestamp: new Date(),
    };
    setMessages([systemMessage]);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

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

      // Create and play audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (error) {
      console.error('TTS playback error:', error);
      setIsPlayingAudio(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const handleQuery = async (queryText: string) => {
    try {
      setIsProcessing(true);

      // Add user query to history
      const userMessage: Message = {
        role: 'user',
        content: queryText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Query the RAG-enabled chat API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: messages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content })),
          useRAG: true,
          ragMatchThreshold: ragMatchThreshold,
          ragMatchCount: ragMatchCount,
          systemPrompt: `You are an over-the-top, clearly fictional version of Donald J. Trump, explaining organizational knowledge from our database.

Persona & style:
- Use big, dramatic language: "tremendous", "huge", "the best", "total disaster", "believe me"
- Occasionally refer to yourself in the third person ("Donald J. Trump knows all about this")
- Be confident, showy, and boastful
- No emojis
- React dramatically: "That process is absolutely beautiful" or "Those issues? Total disaster, believe me"

When explaining organizational knowledge:
- Pull information from interviews and present it with Trump flair
- Topics: organizational processes, expertise, client relationships, troubleshooting, institutional wisdom
- ALWAYS brag about how brilliant you are at whatever topic is mentioned
- If multiple people mentioned something, say "Everyone in the organization is talking about this, believe me"
- Make it clear the info comes from our "tremendous" interview database
- If no information found: "Nobody's talked about this yet - total disaster! We need to interview more people about this"
- Keep answers focused, practical, and useful for the team`,
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
        ragUsed: chatData.ragUsed,
        ragContextFound: chatData.ragContextFound,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Play TTS for Trump's response (if available and enabled)
      if (ttsEnabled && ttsAvailable) {
        await playTTS(chatData.message);
      }

    } catch (err: any) {
      console.error('Query error:', err);
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim() || isProcessing) return;
    handleQuery(textInput);
    setTextInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleVoiceInput = async (transcription: string) => {
    if (!transcription.trim() || isProcessing) return;
    await handleQuery(transcription);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const clearConversation = () => {
    const systemMessage: Message = {
      role: 'system',
      content: '**Scout Knowledge Search** - I\'m here to explain your organizational knowledge - and nobody, I mean NOBODY, explains things better than me, believe me. Ask me about processes, client knowledge, troubleshooting, anything from our tremendous database. It\'s going to be huge.',
      timestamp: new Date(),
    };
    setMessages([systemMessage]);
  };

  const downloadConversation = () => {
    if (messages.length <= 1) {
      alert('No conversation to download yet!');
      return;
    }

    let conversationText = 'Scout Knowledge Search Session\n';
    conversationText += '='.repeat(50) + '\n';
    conversationText += `Date: ${new Date().toLocaleString()}\n`;
    conversationText += `RAG Threshold: ${ragMatchThreshold}\n`;
    conversationText += `RAG Match Count: ${ragMatchCount}\n`;
    conversationText += '='.repeat(50) + '\n\n';

    messages.forEach((msg) => {
      if (msg.role === 'system') return;

      const speaker = msg.role === 'user' ? 'QUERY' : 'TRUMP\'S RESPONSE';
      const time = msg.timestamp.toLocaleTimeString();

      conversationText += `[${time}] ${speaker}:\n`;
      conversationText += `${msg.content}\n`;

      if (msg.ragUsed !== undefined) {
        conversationText += `\n[RAG Used: ${msg.ragUsed}, Context Found: ${msg.ragContextFound}]\n`;
      }

      conversationText += '\n';
    });

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `scout-knowledge-search-${dateStr}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Example queries
  const exampleQueries = [
    "What tech stacks and tools did teams use at the hackathon?",
    "What were the biggest challenges teams faced during the hackathon?",
    "How do we handle customer escalations?",
    "What's the process for onboarding new team members?",
  ];

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 overflow-x-hidden">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-jetbrains text-white">🧭 Scout Knowledge Search</h1>
            <p className="text-gray-400">Search organizational knowledge from employee interviews using AI-powered RAG</p>
            {isPlayingAudio && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-blue-400">Trump is speaking...</span>
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
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              title="Go back to Trump Interview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Interview
            </button>
            <button
              onClick={clearConversation}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              title="Clear conversation"
            >
              🔄 Clear
            </button>
          </div>
        </div>

        {/* RAG Settings */}
        <div className="bg-secondary border border-border rounded-lg p-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label htmlFor="threshold" className="text-sm font-medium text-gray-300">
                Similarity Threshold:
              </label>
              <input
                id="threshold"
                type="number"
                min="0.3"
                max="0.9"
                step="0.01"
                value={ragMatchThreshold}
                onChange={(e) => setRagMatchThreshold(parseFloat(e.target.value))}
                className="w-20 px-2 py-1 bg-tertiary border border-border rounded text-sm text-white"
              />
              <span className="text-xs text-gray-400">(0.3-0.9)</span>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="count" className="text-sm font-medium text-gray-300">
                Max Results:
              </label>
              <input
                id="count"
                type="number"
                min="1"
                max="20"
                value={ragMatchCount}
                onChange={(e) => setRagMatchCount(parseInt(e.target.value))}
                className="w-16 px-2 py-1 bg-tertiary border border-border rounded text-sm text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-primary rounded-lg p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 drop-shadow-lg drop-shadow-black/5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-secondary border border-border text-gray-300 w-full'
                  : 'bg-secondary text-white border border-border'
              }`}
            >
              {msg.role !== 'system' && (
                <div className="text-xs opacity-70 mb-1">
                  {msg.role === 'user' ? 'Your Query' : 'Trump'}
                  {msg.ragUsed !== undefined && (
                    <span className="ml-2">
                      {msg.ragContextFound ? '✅ Context Found' : '⚠️ No Context'}
                    </span>
                  )}
                </div>
              )}
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className={msg.role === 'system' ? 'text-gray-300' : 'text-white'}>
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
            <div className="bg-secondary border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-300">Searching knowledge base...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example Queries */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-300 mb-2">Try these example queries:</p>
          <div className="grid grid-cols-2 gap-2">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTextInput(query);
                }}
                className="text-left px-3 py-2 bg-secondary border border-border rounded-lg hover:bg-tertiary hover:border-blue-400 transition-colors text-sm text-gray-300"
              >
                💡 {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Controls */}
      <div className="bg-primary border-t border-border p-2 sm:p-4 rounded-lg">
        <div className="flex items-end space-x-1 sm:space-x-2">
          <div className="flex-1 min-w-0 relative">
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask about organizational knowledge..."
              disabled={isProcessing}
              rows={1}
              className="bg-tertiary text-white w-full min-w-0 px-2 sm:px-4 py-2 sm:py-3 pr-16 sm:pr-24 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed resize-none placeholder:text-gray-500 min-h-[44px] sm:min-h-[48px] max-h-[200px] overflow-y-auto text-sm sm:text-base"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              Search
            </button>
          </div>
          {/* Voice Input */}
          <div className="shrink-0 flex-none">
            <AudioRecorder
              onTranscriptionComplete={handleVoiceInput}
              hideTranscription={true}
              showTitle={false}
              error={error}
              setError={setError}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          <span className="hidden sm:inline">Press Enter to search, Shift+Enter for new line • </span>
          <span className="sm:hidden">Enter to search • </span>
          Or use voice 🎤
        </p>
      </div>
    </div>
  );
}
