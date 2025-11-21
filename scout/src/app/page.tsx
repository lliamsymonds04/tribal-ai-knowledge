'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello. I\'m ready to begin the interview whenever you are.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response with echo (dummy function)
    await simulateBotResponse(inputValue);
  };

  const simulateBotResponse = async (userInput: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: userInput, // Echo the user's message for now
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-100">
      {/* Avatar Section */}
      <div className="flex-[2] max-h-1/2 bg-black flex items-center justify-center relative overflow-clip">
        <Image
          src="/placeholder.png"
          alt="Avatar"
          width={1280}
          height={720}
          className="object-cover"
          priority
        />
      </div>

      {/* Chat Section */}
      <div className="flex-1 min-h-1/2 min-w-[400px] bg-white flex flex-col">
        {/* Header */}
        <div className="px-6 py-6 border-b border-neutral-200">
          <h1 className="text-xl font-semibold text-neutral-900">
            Interview Session
          </h1>
        </div>

        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-xs text-neutral-500 mb-1.5 px-2">
                {message.sender === 'user' ? 'You' : 'Interviewer'}
              </div>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-200 text-neutral-900'
                }`}
              >
                <p className="text-[15px] leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="text-xs text-neutral-500 mb-1.5 px-2">
                Interviewer
              </div>
              <div className="bg-neutral-200 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-6 border-t border-neutral-200 bg-white">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              className="text-black flex-1 px-4 py-3 border border-neutral-300 rounded-full text-[15px] outline-none focus:border-blue-500 transition-colors"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-6 py-3 bg-blue-500 text-white rounded-full text-[15px] font-medium hover:bg-blue-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
