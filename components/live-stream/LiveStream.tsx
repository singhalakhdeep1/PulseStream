import React, { useState, useEffect, useRef } from 'react';

interface LiveStreamProps {
  streamId?: string;
  userId: string;
  isStreamer?: boolean;
}

export function LiveStream({ streamId, userId, isStreamer = false }: LiveStreamProps) {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (streamId) {
      // Join existing stream as viewer
      joinStream(streamId);
    }
  }, [streamId]);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }

      // Create stream via API
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLive(true);
        // Start broadcasting via WebSocket
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const stopStreaming = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLive(false);
  };

  const joinStream = async (id: string) => {
    // Connect to stream via WebSocket
    // Update viewer count
    setViewerCount(Math.floor(Math.random() * 1000) + 100);
  };

  const sendComment = async () => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      userId,
      username: 'You',
      content: comment,
      timestamp: new Date(),
    };

    setComments(prev => [...prev, newComment]);
    setComment('');

    // Send comment via WebSocket
  };

  return (
    <div className="flex flex-col h-full">
      {/* Video player */}
      <div className="relative bg-black aspect-video">
        {isStreamer ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-2">📡</div>
              <div>Stream loading...</div>
            </div>
          </div>
        )}

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-semibold">LIVE</span>
          </div>
        )}

        {/* Viewer count */}
        {isLive && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full">
            👁 {viewerCount}
          </div>
        )}

        {/* Streamer controls */}
        {isStreamer && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
            {!isLive ? (
              <button
                onClick={startStreaming}
                className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
              >
                Go Live
              </button>
            ) : (
              <button
                onClick={stopStreaming}
                className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition"
              >
                End Stream
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col border-t">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <span className="font-semibold text-blue-500">{comment.username}:</span>
              <span>{comment.content}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendComment()}
            placeholder="Send a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendComment}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
