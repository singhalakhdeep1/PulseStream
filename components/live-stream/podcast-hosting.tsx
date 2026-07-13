'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Mic, Upload, Play, Pause, Download, Share2, Calendar, Clock } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number;
  publishDate: Date;
  audioUrl: string;
  coverImage?: string;
}

interface PodcastHostingProps {
  onUploadEpisode?: (episode: Omit<Episode, 'id' | 'publishDate'>) => Promise<void>;
}

export default function PodcastHosting({ onUploadEpisode }: PodcastHostingProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([
    {
      id: '1',
      title: 'Episode 1: Introduction',
      description: 'Welcome to our podcast series',
      duration: 1800,
      publishDate: new Date('2024-01-01'),
      audioUrl: '/audio/episode1.mp3'
    },
    {
      id: '2',
      title: 'Episode 2: Deep Dive',
      description: 'Exploring advanced topics',
      duration: 2400,
      publishDate: new Date('2024-01-08'),
      audioUrl: '/audio/episode2.mp3'
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
  };

  const handlePlay = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  const generateRSSFeed = () => {
    // Generate RSS feed for podcast platforms
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>My Podcast</title>
    <description>Amazing podcast content</title>
    <link>https://example.com/podcast</link>
    ${episodes.map(ep => `
    <item>
      <title>${ep.title}</title>
      <description>${ep.description}</description>
      <enclosure url="${ep.audioUrl}" type="audio/mpeg" length="${ep.duration}" />
      <pubDate>${ep.publishDate.toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;
    
    const blob = new Blob([rss], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'podcast.rss';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border rounded-lg bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold">Podcast Hosting</h3>
        </div>
        <Button variant="outline" size="sm" onClick={generateRSSFeed}>
          <Download className="w-4 h-4 mr-2" />
          RSS Feed
        </Button>
      </div>

      {/* Upload Section */}
      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="font-medium">Upload New Episode</h4>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Episode title"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Episode description"
            className="w-full px-3 py-2 border rounded-lg h-20 resize-none"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="space-y-3">
        <h4 className="font-medium">Episodes ({episodes.length})</h4>
        <div className="space-y-2">
          {episodes.map(episode => (
            <div
              key={episode.id}
              className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-medium">{episode.title}</h5>
                  <p className="text-sm text-muted-foreground">{episode.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePlay(episode)}
                >
                  {currentEpisode?.id === episode.id && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(episode.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{episode.publishDate.toLocaleDateString()}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Player */}
      {currentEpisode && (
        <div className="border rounded-lg p-4 bg-muted">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium">{currentEpisode.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(currentTime)} / {formatDuration(currentEpisode.duration)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={currentEpisode.duration}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
