"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import type { Story } from "@/types";

interface Props {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const DURATION = 5000;

  const story = stories[current];

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (current < stories.length - 1) setCurrent((c) => c + 1);
          else onClose();
          return 0;
        }
        return p + (100 / (DURATION / 100));
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [current, paused, stories.length]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full max-w-sm h-[85vh] rounded-2xl overflow-hidden bg-black">
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-3 right-3 flex items-center gap-2 z-10">
          <Avatar className="w-8 h-8 ring-2 ring-white">
            <AvatarImage src={story.author?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">{getInitials(story.author?.username ?? "")}</AvatarFallback>
          </Avatar>
          <span className="text-white text-sm font-semibold drop-shadow">@{story.author?.username}</span>
          <span className="text-white/70 text-xs">{formatRelativeTime(new Date(story.created_at))}</span>
          <div className="flex-1" />
          <button onClick={onClose} className="text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media */}
        {story.media_type === "image" ? (
          <img src={story.media_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <video src={story.media_url} autoPlay loop muted className="w-full h-full object-cover" />
        )}

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-6 left-4 right-4 text-white text-sm font-medium drop-shadow-lg">
            {story.caption}
          </div>
        )}

        {/* Navigation tap areas */}
        <button className="absolute left-0 top-0 w-1/3 h-full z-20" onClick={() => setCurrent((c) => Math.max(0, c - 1))} />
        <button className="absolute right-0 top-0 w-1/3 h-full z-20" onClick={() => {
          if (current < stories.length - 1) setCurrent((c) => c + 1);
          else onClose();
        }} />

        {/* Pause button */}
        <button
          className="absolute bottom-14 right-4 z-30 text-white/80 hover:text-white"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>
      </div>

      {/* Side navigation */}
      {current > 0 && (
        <button onClick={() => setCurrent((c) => c - 1)} className="absolute left-4 text-white hidden md:block">
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {current < stories.length - 1 && (
        <button onClick={() => setCurrent((c) => c + 1)} className="absolute right-4 text-white hidden md:block">
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Backdrop close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
