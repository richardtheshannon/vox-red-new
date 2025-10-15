'use client';

import { useState, useRef } from 'react';

interface AudioUploaderProps {
  currentAudioUrl: string | null;
  onUploadComplete: (url: string) => void;
  rowId: string;
}

export default function AudioUploader({ currentAudioUrl, onUploadComplete, rowId }: AudioUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload MP3, WAV, or OGG files only.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'audio');
      formData.append('rowId', rowId);

      const response = await fetch('/api/slides/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);
      onUploadComplete(data.url);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
        Audio File (MP3, WAV, OGG)
      </label>

      {/* Current Audio Display */}
      {currentAudioUrl && !uploading && (
        <div
          className="p-4 rounded flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-rounded" style={{ fontSize: '24px', color: 'var(--icon-color)' }}>
              audiotrack
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                {currentAudioUrl.split('/').pop()}
              </p>
              <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>
                {currentAudioUrl}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="px-3 py-1 rounded text-sm transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#991b1b',
              color: 'white'
            }}
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload Button */}
      {!currentAudioUrl && !uploading && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
            onChange={handleFileSelect}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="inline-block px-4 py-2 rounded cursor-pointer transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#dc2626',
              color: 'white'
            }}
          >
            Choose Audio File
          </label>
          <p className="text-xs mt-2" style={{ color: 'var(--secondary-text)' }}>
            Maximum file size: 10MB. Supported formats: MP3, WAV, OGG
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div
          className="p-4 rounded"
          style={{
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-rounded animate-spin" style={{ fontSize: '20px', color: 'var(--icon-color)' }}>
              progress_activity
            </span>
            <p className="text-sm" style={{ color: 'var(--text-color)' }}>
              Uploading audio file...
            </p>
          </div>
          <div
            className="w-full h-2 rounded overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
                backgroundColor: '#dc2626'
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="p-3 rounded"
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5'
          }}
        >
          <p className="text-sm font-semibold">Upload Error</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Replace Audio Option */}
      {currentAudioUrl && !uploading && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
            onChange={handleFileSelect}
            className="hidden"
            id="audio-replace"
          />
          <label
            htmlFor="audio-replace"
            className="inline-block px-4 py-2 rounded cursor-pointer transition-opacity hover:opacity-80 text-sm"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          >
            Replace Audio File
          </label>
        </div>
      )}
    </div>
  );
}
