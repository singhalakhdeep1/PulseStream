import React, { useState } from 'react';

interface ModerationResult {
  isSafe: boolean;
  categories: {
    hate: number;
    harassment: number;
    selfHarm: number;
    sexual: number;
    violence: number;
  };
  flagged: boolean;
  reason?: string;
}

interface ContentModeratorProps {
  onContentApproved?: (content: string) => void;
  onContentRejected?: (content: string, reason: string) => void;
}

export function ContentModerator({ onContentApproved, onContentRejected }: ContentModeratorProps) {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ModerationResult | null>(null);

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/moderation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const moderationResult = await response.json();
        setResult(moderationResult);
      }
    } catch (error) {
      console.error('Failed to analyze content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = () => {
    if (result?.isSafe) {
      onContentApproved?.(content);
      setContent('');
      setResult(null);
    }
  };

  const handleReject = () => {
    if (result?.flagged) {
      onContentRejected?.(content, result.reason || 'Content flagged by moderation');
      setContent('');
      setResult(null);
    }
  };

  const getCategoryColor = (score: number) => {
    if (score < 0.3) return 'bg-green-500';
    if (score < 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryLabel = (score: number) => {
    if (score < 0.3) return 'Safe';
    if (score < 0.6) return 'Caution';
    return 'High Risk';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Content to Moderate</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter content to analyze..."
          className="w-full p-3 border rounded-lg resize-none"
          rows={4}
        />
      </div>

      <button
        onClick={analyzeContent}
        disabled={!content.trim() || isAnalyzing}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
      </button>

      {result && (
        <div className={`p-4 rounded-lg border ${result.isSafe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${result.isSafe ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`font-semibold ${result.isSafe ? 'text-green-700' : 'text-red-700'}`}>
              {result.isSafe ? 'Content is Safe' : 'Content Flagged'}
            </span>
          </div>

          {result.flagged && result.reason && (
            <div className="mb-4 text-sm text-red-600">
              <strong>Reason:</strong> {result.reason}
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm font-medium">Category Scores:</div>
            
            {Object.entries(result.categories).map(([category, score]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{category}</span>
                  <span className="font-medium">{(score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getCategoryColor(score)}`}
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Status: <span className={`font-medium ${getCategoryColor(score) === 'bg-green-500' ? 'text-green-600' : getCategoryColor(score) === 'bg-yellow-500' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {getCategoryLabel(score)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            {result.isSafe ? (
              <button
                onClick={handleApprove}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Approve Content
              </button>
            ) : (
              <button
                onClick={handleReject}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Reject Content
              </button>
            )}
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Auto-moderation settings info */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm">
          <strong>Auto-Moderation:</strong> Content is automatically analyzed before posting. 
          Posts flagged with high-risk scores will require manual review.
        </div>
      </div>
    </div>
  );
}
