import React, { useState } from 'react';

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls?: string[];
  scheduledFor: Date;
  platforms: string[];
  status: 'scheduled' | 'posted' | 'failed';
}

interface PostSchedulerProps {
  userId: string;
}

export function PostScheduler({ userId }: PostSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const PLATFORMS = [
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  ];

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const schedulePost = async () => {
    if (!content.trim() || !scheduledDate || !scheduledTime || platforms.length === 0) {
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      content,
      scheduledFor,
      platforms,
      status: 'scheduled',
    };

    try {
      await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content,
          scheduledFor: scheduledFor.toISOString(),
          platforms,
        }),
      });

      setScheduledPosts(prev => [...prev, newPost]);
      setIsOpen(false);
      setContent('');
      setScheduledDate('');
      setScheduledTime('');
      setPlatforms([]);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  const deleteScheduledPost = async (postId: string) => {
    try {
      await fetch(`/api/posts/schedule/${postId}`, {
        method: 'DELETE',
      });
      setScheduledPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete scheduled post:', error);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Schedule Post
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Schedule Post</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">{content.length}/500</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        platforms.includes(platform.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{platform.icon}</span>
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={schedulePost}
                disabled={!content.trim() || !scheduledDate || !scheduledTime || platforms.length === 0}
                className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Post
              </button>

              {scheduledPosts.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Scheduled Posts</h3>
                  <div className="space-y-2">
                    {scheduledPosts.map((post) => (
                      <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm">{post.content}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDateTime(post.scheduledFor)}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {post.platforms.map(p => (
                                <span key={p} className="text-xs">
                                  {PLATFORMS.find(pl => pl.id === p)?.icon}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteScheduledPost(post.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
