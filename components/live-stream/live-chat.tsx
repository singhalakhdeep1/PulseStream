'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Send, MessageSquare, Users, Heart, Share2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  isModerator?: boolean;
}

interface LiveChatProps {
  streamId: string;
  onSendMessage?: (message: string) => void;
}

export default function LiveChat({ streamId, onSendMessage }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate real-time chat messages
    const interval = setInterval(() => {
      const mockMessages: ChatMessage[] = [
        {
          id: Date.now().toString(),
          userId: 'user1',
          username: 'Viewer1',
          message: 'Great stream! 🔥',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          userId: 'user2',
          username: 'Viewer2',
          message: 'Love the content',
          timestamp: new Date()
        }
      ];

      if (Math.random() > 0.7) {
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        setMessages(prev => [...prev.slice(-50), randomMessage]);
      }
    }, 3000);

    // Simulate viewer count
    setViewerCount(Math.floor(Math.random() * 1000) + 100);

    return () => clearInterval(interval);
  }, [streamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      username: 'You',
      message: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    onSendMessage?.(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <h3 className="font-semibold">Live Chat</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{viewerCount.toLocaleString()} viewers</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chat is empty. Be the first to message!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.userId === 'current-user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.userId !== 'current-user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
                  {message.username[0]}
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-lg p-2 ${
                message.userId === 'current-user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                {message.userId !== 'current-user' && (
                  <p className="text-xs font-medium mb-1">{message.username}</p>
                )}
                <p className="text-sm break-words">{message.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Send a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" size="sm" className="flex-1">
            <Heart className="w-4 h-4 mr-1" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
