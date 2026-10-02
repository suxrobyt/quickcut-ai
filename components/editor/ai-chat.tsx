'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { apiGet, apiPost } from '@/lib/api';
import toast from 'react-hot-toast';

interface AIChatProps {
  projectId: string;
}

export function AIChat({ projectId }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    const loadChat = async () => {
      try {
        const response = await apiGet<ChatMessage[]>(
          `/api/projects/${projectId}/chat`
        );
        if (response.data) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      }
    };

    loadChat();
  }, [projectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiPost<{ message: string }>(
        `/api/projects/${projectId}/chat`,
        { message: userMessage }
      );

      if (response.data?.message) {
        // Add user message
        const newUserMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          project_id: projectId,
          role: 'user',
          message: userMessage,
          created_at: new Date().toISOString(),
        };

        // Add assistant message
        const newAssistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-1`,
          project_id: projectId,
          role: 'assistant',
          message: response.data.message,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newUserMessage, newAssistantMessage]);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-qc-panel">
      {/* Header */}
      <div className="px-4 py-4 border-b border-qc-border">
        <h3 className="font-semibold">QuickCut Director</h3>
        <p className="text-xs text-gray-400">AI Editing Assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-gray-400">
              <p className="text-sm font-medium mb-2">👋 Hello!</p>
              <p className="text-xs">Tell me what you want to edit.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-qc-primary text-white'
                  : 'bg-qc-border text-gray-100'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="bg-qc-border rounded-lg px-4 py-2">
              <Loader className="w-4 h-4 animate-spin text-qc-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-qc-border p-4 flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tell QuickCut what to do..."
          disabled={isLoading}
          className="flex-1 bg-qc-bg border border-qc-border rounded-lg px-3 py-2 text-sm focus:border-qc-primary focus:outline-none transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="p-2 bg-qc-primary hover:bg-opacity-90 rounded-lg transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
