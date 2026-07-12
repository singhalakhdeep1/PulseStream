import React, { useState, useRef } from 'react';

interface StoryCreatorProps {
  userId: string;
  onStoryCreated?: (story: any) => void;
}

export function StoryCreator({ userId, onStoryCreated }: StoryCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      const preview = URL.createObjectURL(file);
      setMediaPreview(preview);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      // In a real implementation, you'd show a camera UI here
      // For now, we'll just trigger the file input
      fileInputRef.current?.click();
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const handleSubmit = async () => {
    if (!media) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', media);
      formData.append('userId', userId);
      formData.append('caption', caption);

      const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const story = await response.json();
        onStoryCreated?.(story);
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create story:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setMedia(null);
    setMediaPreview(null);
    setCaption('');
  };

  const isVideo = media?.type.startsWith('video/');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Create Story</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {!mediaPreview ? (
                <div className="aspect-[9/16] bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Select from Gallery
                  </button>
                  <button
                    onClick={handleCameraCapture}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Take Photo/Video
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                    {isVideo ? (
                      <video
                        src={mediaPreview}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isUploading}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {isUploading ? 'Uploading...' : 'Share Story'}
                    </button>
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
