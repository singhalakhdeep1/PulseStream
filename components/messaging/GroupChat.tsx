import React, { useState, useEffect, useRef } from 'react';

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  replyTo?: string;
}

interface GroupChatProps {
  groupId: string;
  currentUserId: string;
  groupName: string;
}

export function GroupChat({ groupId, currentUserId, groupName }: GroupChatProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: GroupMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'You',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      await fetch(`/api/groups/${groupId}/messages`, {
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {groupName[0]}
          </div>
          <div>
            <div className="font-semibold">{groupName}</div>
            <div className="text-xs text-gray-500">{members.length} members</div>
          </div>
        </div>
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>

      {/* Members panel */}
      {showMembers && (
        <div className="border-b p-4 bg-gray-50">
          <h4 className="font-semibold mb-2">Members</h4>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {member.name[0]}
                  </div>
                )}
                <span className="text-sm">{member.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowMembers(false)}
            className="mt-3 text-sm text-blue-500 hover:text-blue-600"
          >
            Add member
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-xs lg:max-w-md ${message.senderId === currentUserId ? 'flex-row-reverse' : ''}`}>
              {message.senderId !== currentUserId && (
                <>
                  {message.senderAvatar ? (
                    <img
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {message.senderName[0]}
                    </div>
                  )}
                </>
              )}
              <div>
                {message.senderId !== currentUserId && (
                  <div className="text-xs text-gray-500 mb-1">{message.senderName}</div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
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
          placeholder={`Message ${groupName}...`}
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
  );
}
