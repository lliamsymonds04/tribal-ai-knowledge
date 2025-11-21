'use client';

import { useState, useRef, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIInterviewer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial greeting when component mounts
  useEffect(() => {
    const initializeInterview = async () => {
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
          setMessages([{
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          }]);
        }
      } catch (err) {
        console.error('Failed to initialize interview:', err);
      }
    };

    initializeInterview();
  }, []);

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

      // Add AI response to history
      const aiMessage: Message = {
        role: 'assistant',
        content: chatData.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

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
    let conversationText = 'AI Interview Transcript\n';
    conversationText += '='.repeat(50) + '\n';
    conversationText += `Date: ${new Date().toLocaleString()}\n`;
    conversationText += '='.repeat(50) + '\n\n';

    messages.forEach((msg, index) => {
      const speaker = msg.role === 'user' ? 'CANDIDATE' : 'AI INTERVIEWER';
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

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Interviewer</h1>
          <p className="text-gray-600">Speak or type your responses</p>
        </div>
        <button
          onClick={downloadConversation}
          disabled={messages.length === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            messages.length === 0
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
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.role === 'user' ? 'You' : 'AI Interviewer'}
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Controls */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          {/* Voice Input */}
          <div className="shrink-0">
            <AudioRecorder
              onTranscriptionComplete={handleUserMessage}
              hideTranscription={true}
              showTitle={false}
              startButtonText="🎤 Speak"
              stopButtonText="⏹ Stop"
            />
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-gray-300"></div>

          {/* Text Input */}
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Or type your message..."
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
