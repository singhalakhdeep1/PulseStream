import React, { useState, useEffect } from 'react';
import { StoryViewer } from './StoryViewer';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: Date;
  expiresAt: Date;
  viewers?: string[];
}

interface StoryTrayProps {
  currentUserId: string;
}

export function StoryTray({ currentUserId }: StoryTrayProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupStoriesByUser = (stories: Story[]) => {
    const grouped = new Map<string, Story[]>();
    
    for (const story of stories) {
      if (!grouped.has(story.userId)) {
        grouped.set(story.userId, []);
      }
      grouped.get(story.userId)!.push(story);
    }
    
    return Array.from(grouped.entries()).map(([userId, userStories]) => ({
      userId,
      userName: userStories[0].userName,
      userAvatar: userStories[0].userAvatar,
      stories: userStories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      hasUnviewed: userStories.some(s => !s.viewers?.includes(currentUserId)),
    }));
  };

  const groupedStories = groupStoriesByUser(stories);

  const handleStoryClick = (userStories: Story[], index: number) => {
    setSelectedStories(userStories);
    setStartIndex(index);
    setShowViewer(true);
  };

  const handleStoryCreated = (newStory: Story) => {
    setStories(prev => [newStory, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto border-b">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 p-4 overflow-x-auto border-b bg-white">
        {/* Add story button */}
        <div className="flex-shrink-0">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">Add story</span>
          </div>
        </div>

        {/* User stories */}
        {groupedStories.map((group) => (
          <button
            key={group.userId}
            onClick={() => handleStoryClick(group.stories, 0)}
            className="flex-shrink-0"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${
                  group.hasUnviewed
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gray-300'
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  {group.userAvatar ? (
                    <img
                      src={group.userAvatar}
                      alt={group.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {group.userName[0]}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-600 max-w-16 truncate">
                {group.userName}
              </span>
            </div>
          </button>
        ))}
      </div>

      {showViewer && (
        <StoryViewer
          stories={selectedStories}
          currentUserId={currentUserId}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}

