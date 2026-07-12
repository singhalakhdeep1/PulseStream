import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface DirectMessagesProps {
  currentUserId: string;
}

export function DirectMessages({ currentUserId }: DirectMessagesProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'You',
      content: newMessage,
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      await fetch(`/api/messages/conversations/${selectedConversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full bg-white">
      {/* Conversations list */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition ${
                selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                {conv.userAvatar ? (
                  <img
                    src={conv.userAvatar}
                    alt={conv.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {conv.userName[0]}
                  </div>
                )}
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">{conv.userName}</div>
                <div className="text-sm text-gray-500 truncate">
                  {conv.lastMessage || 'No messages yet'}
                </div>
              </div>
              {conv.lastMessageTime && (
                <div className="text-xs text-gray-400">
                  {formatTime(conv.lastMessageTime)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center gap-3">
            {selectedConversation.userAvatar ? (
              <img
                src={selectedConversation.userAvatar}
                alt={selectedConversation.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {selectedConversation.userName[0]}
              </div>
            )}
            <div className="font-semibold">{selectedConversation.userName}</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderId === currentUserId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div>{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <div>Select a conversation to start messaging</div>
          </div>
        </div>
      )}

      {/* New chat modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">New Message</h3>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewChat(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
