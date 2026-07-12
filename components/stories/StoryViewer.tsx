import React, { useState, useEffect, useRef } from 'react';

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

interface StoryViewerProps {
  stories: Story[];
  currentUserId: string;
  onClose: () => void;
}

export function StoryViewer({ stories, currentUserId, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory) return;

    setProgress(0);
    setIsPaused(false);

    const duration = currentStory.mediaType === 'video' ? 15000 : 5000;
    const interval = 100;
    const increment = (interval / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, currentStory]);

  useEffect(() => {
    if (currentStory && !currentStory.viewers?.includes(currentUserId)) {
      // Mark as viewed
      markAsViewed(currentStory.id);
    }
  }, [currentIndex, currentStory, currentUserId]);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (!isPaused && currentStory) {
      const duration = currentStory.mediaType === 'video' ? 15000 : 5000;
      const interval = 100;
      const increment = (interval / duration) * 100;
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            goToNext();
            return 0;
          }
          return prev + increment;
        });
      }, interval);
    }
  };

  const markAsViewed = async (storyId: string) => {
    // API call to mark story as viewed
    try {
      await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
    } catch (error) {
      console.error('Failed to mark story as viewed:', error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setProgress(percentage);
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full max-w-lg h-full max-h-[90vh] bg-black">
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white transition-all"
                style={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {currentStory.userName[0]}
            </div>
            <div className="text-white">
              <div className="font-semibold">{currentStory.userName}</div>
              <div className="text-xs text-white/70">
                {new Date(currentStory.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white p-2 hover:bg-white/10 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          onClick={togglePause}
        >
          {currentStory.mediaType === 'image' ? (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.caption || 'Story'}
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4 z-20">
            <p className="text-white text-sm bg-black/50 p-3 rounded-lg backdrop-blur-sm">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="absolute inset-0 flex z-10">
          <button
            onClick={goToPrevious}
            className="flex-1"
            disabled={currentIndex === 0}
          />
          <button
            onClick={goToNext}
            className="flex-1"
            disabled={currentIndex === stories.length - 1}
          />
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
