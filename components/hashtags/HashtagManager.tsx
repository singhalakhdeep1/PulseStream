import React, { useState, useEffect } from 'react';

interface Hashtag {
  id: string;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface HashtagManagerProps {
  onHashtagsChange?: (hashtags: string[]) => void;
  initialHashtags?: string[];
}

export function HashtagManager({ onHashtagsChange, initialHashtags = [] }: HashtagManagerProps) {
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(initialHashtags);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Hashtag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      const response = await fetch('/api/hashtags/trending');
      if (response.ok) {
        const data = await response.json();
        setTrendingHashtags(data);
      }
    } catch (error) {
      console.error('Failed to fetch trending hashtags:', error);
    }
  };

  const searchHashtags = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/hashtags/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Failed to search hashtags:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.startsWith('#')) {
      searchHashtags(value.slice(1));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addHashtag = (hashtag: string) => {
    const normalized = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (!selectedHashtags.includes(normalized)) {
      const newHashtags = [...selectedHashtags, normalized];
      setSelectedHashtags(newHashtags);
      onHashtagsChange?.(newHashtags);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeHashtag = (hashtag: string) => {
    const newHashtags = selectedHashtags.filter(h => h !== hashtag);
    setSelectedHashtags(newHashtags);
    onHashtagsChange?.(newHashtags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addHashtag(inputValue);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Hashtags</label>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Add hashtags (start with #)"
            className="w-full p-3 border rounded-lg pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((hashtag) => (
              <button
                key={hashtag.id}
                onClick={() => addHashtag(hashtag.name)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition flex items-center justify-between"
              >
                <span>#{hashtag.name}</span>
                <span className="text-xs text-gray-500">{formatCount(hashtag.count)} posts</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedHashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedHashtags.map((hashtag) => (
            <div
              key={hashtag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
            >
              <span>{hashtag}</span>
              <button
                onClick={() => removeHashtag(hashtag)}
                className="hover:text-blue-900 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {trendingHashtags.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Trending Hashtags</div>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.slice(0, 10).map((hashtag) => (
              <button
                key={hashtag.id}
                onClick={() => addHashtag(hashtag.name)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedHashtags.includes(`#${hashtag.name}`)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-1">
                  #{hashtag.name}
                  {hashtag.trend === 'up' && <span className="text-green-500">↑</span>}
                  {hashtag.trend === 'down' && <span className="text-red-500">↓</span>}
                </span>
                <span className="text-xs opacity-70 ml-1">{formatCount(hashtag.count)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <strong>Tips:</strong>
        <ul className="mt-1 space-y-1">
          <li>• Use 3-5 relevant hashtags for optimal reach</li>
          <li>• Mix popular and niche hashtags</li>
          <li>• Create branded hashtags for your content</li>
          <li>• Avoid using banned or restricted hashtags</li>
        </ul>
      </div>
    </div>
  );
}
