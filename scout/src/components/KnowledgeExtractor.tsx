'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  ragUsed?: boolean;
  ragContextFound?: boolean;
}

export default function KnowledgeExtractor() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [ragMatchThreshold, setRagMatchThreshold] = useState<number>(0.65);
  const [ragMatchCount, setRagMatchCount] = useState<number>(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial greeting when component mounts
  useEffect(() => {
    const systemMessage: Message = {
      role: 'system',
      content: '🧭 **Scout Knowledge Search** - Ask questions about organizational knowledge captured from employee interviews. Search through processes, expertise, client relationships, and institutional wisdom.',
      timestamp: new Date(),
    };
    setMessages([systemMessage]);
  }, []);

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
          systemPrompt: `You are Scout, an AI assistant helping organizations access tribal knowledge captured from employee interviews. Your role is to help users find and understand organizational processes, expertise, client relationships, and institutional wisdom.

When answering:
- Provide specific, actionable information from the retrieved knowledge
- If multiple employees or interviews mention the topic, synthesize the information clearly
- Cite specific processes, approaches, or insights when available
- Help preserve valuable organizational knowledge for onboarding, training, and succession planning
- If no relevant information is found, suggest related topics or encourage more knowledge capture
- Be concise but thorough in your responses`,
        }),
      });

      const chatData = await chatResponse.json();

      if (!chatResponse.ok) {
        throw new Error(chatData.error || 'Failed to get response from AI');
      }

      // Add AI response to history
      const aiMessage: Message = {
        role: 'assistant',
        content: chatData.message,
        timestamp: new Date(),
        ragUsed: chatData.ragUsed,
        ragContextFound: chatData.ragContextFound,
      };

      setMessages(prev => [...prev, aiMessage]);

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
      content: '🧭 **Scout Knowledge Search** - Ask questions about organizational knowledge captured from employee interviews. Search through processes, expertise, client relationships, and institutional wisdom.',
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

      const speaker = msg.role === 'user' ? 'QUERY' : 'AI RESPONSE';
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
    "How do we handle customer escalations?",
    "What's the process for onboarding new team members?",
    "Who has expertise with our main client accounts?",
    "What troubleshooting steps are recommended for common issues?",
  ];

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧭 Scout Knowledge Search</h1>
            <p className="text-gray-600">Search organizational knowledge from employee interviews using AI-powered RAG</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              title="Go back to AI Interviewer"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label htmlFor="threshold" className="text-sm font-medium text-blue-900">
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
                className="w-20 px-2 py-1 border border-blue-300 rounded text-sm text-black"
              />
              <span className="text-xs text-blue-700">(0.3-0.9)</span>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="count" className="text-sm font-medium text-blue-900">
                Max Results:
              </label>
              <input
                id="count"
                type="number"
                min="1"
                max="20"
                value={ragMatchCount}
                onChange={(e) => setRagMatchCount(parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-blue-300 rounded text-sm text-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-purple-100 border border-purple-300 text-purple-900 w-full'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {msg.role !== 'system' && (
                <div className="text-xs opacity-70 mb-1">
                  {msg.role === 'user' ? 'Your Query' : 'AI Response'}
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
                <div className={msg.role === 'system' ? 'text-purple-900' : 'text-black'}>
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
                <span className="text-gray-600">Searching knowledge base...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example Queries */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Try these example queries:</p>
          <div className="grid grid-cols-2 gap-2">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTextInput(query);
                }}
                className="text-left px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 transition-colors text-sm text-gray-700"
              >
                💡 {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Controls */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-lg">
        <div className="flex items-end space-x-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about processes, expertise, client knowledge, or institutional wisdom..."
            disabled={isProcessing}
            rows={3}
            className="text-black flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium h-[72px]"
          >
            🔍 Search
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to search, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
