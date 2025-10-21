'use client';

import { useState } from 'react';
import { SpaTrack } from '@/lib/queries/spaTracks';

interface SpaTrackFormProps {
  track?: SpaTrack | null;
  onSave: (trackData: Partial<SpaTrack>) => Promise<void>;
  onCancel: () => void;
}

export default function SpaTrackForm({ track, onSave, onCancel }: SpaTrackFormProps) {
  const [title, setTitle] = useState(track?.title || '');
  const [audioUrl, setAudioUrl] = useState(track?.audio_url || '');
  const [isPublished, setIsPublished] = useState(track?.is_published ?? true);
  const [displayOrder, setDisplayOrder] = useState(track?.display_order || 0);
  const [isRandom, setIsRandom] = useState(track?.is_random || false);
  const [publishTimeStart, setPublishTimeStart] = useState<string>(track?.publish_time_start || '');
  const [publishTimeEnd, setPublishTimeEnd] = useState<string>(track?.publish_time_end || '');
  const [publishDays, setPublishDays] = useState<number[]>(() => {
    if (track?.publish_days) {
      try {
        return JSON.parse(track.publish_days);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [allDays, setAllDays] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!audioUrl.trim()) {
      setError('Audio URL is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const trackData: Partial<SpaTrack> = {
        title: title.trim(),
        audio_url: audioUrl.trim(),
        is_published: isPublished,
        display_order: displayOrder,
        is_random: isRandom,
        publish_time_start: publishTimeStart || null,
        publish_time_end: publishTimeEnd || null,
        publish_days: publishDays.length > 0 ? JSON.stringify(publishDays) : null,
      };

      await onSave(trackData);
    } catch (err) {
      console.error('Error saving spa track:', err);
      setError(err instanceof Error ? err.message : 'Failed to save spa track');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div
          className="p-4"
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5'
          }}
        >
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <div
        className="p-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
          {track ? 'Edit Spa Track' : 'Add New Spa Track'}
        </h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter track title..."
            className="w-full px-4 py-2"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          />
        </div>

        {/* Audio URL */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            Audio File URL (MP3, WAV, OGG) *
          </label>
          <input
            type="text"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3 or /media/spa/audio.mp3"
            className="w-full px-4 py-2"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
            Paste a link to an MP3 file (external URL or local path)
          </p>
        </div>

        {/* Published Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4"
              style={{ accentColor: '#dc2626' }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Published
            </span>
          </label>
        </div>

        {/* Display Order */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            Display Order
          </label>
          <input
            type="number"
            min="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2"
            style={{
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
            Lower numbers play first (used when random mode is off)
          </p>
        </div>

        {/* Random Selection */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRandom}
              onChange={(e) => setIsRandom(e.target.checked)}
              className="w-4 h-4"
              style={{ accentColor: '#dc2626' }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Include in Random Selection
            </span>
          </label>
          <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
            When enabled, this track will be included in the random shuffle pool
          </p>
        </div>

        {/* Scheduling Section */}
        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <h3 className="text-md font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
            SCHEDULING SETTINGS (Optional)
          </h3>

          {/* Time Window */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
              Time Window
            </h4>

            {/* Start Time */}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--secondary-text)' }}>
                Start Time
              </label>
              <input
                type="time"
                value={publishTimeStart}
                onChange={(e) => setPublishTimeStart(e.target.value)}
                className="w-full px-3 py-2"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--secondary-text)' }}>
                End Time
              </label>
              <input
                type="time"
                value={publishTimeEnd}
                onChange={(e) => setPublishTimeEnd(e.target.value)}
                className="w-full px-3 py-2"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>
          </div>

          {/* Allowed Days */}
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
              Allowed Days
            </h4>

            {/* All Days Checkbox */}
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allDays}
                  onChange={(e) => {
                    setAllDays(e.target.checked);
                    if (e.target.checked) {
                      setPublishDays([]);
                    }
                  }}
                  className="w-4 h-4"
                  style={{ accentColor: '#dc2626' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-color)' }}>
                  All days
                </span>
              </label>
            </div>

            {/* Individual Day Checkboxes */}
            <div className="space-y-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                const dayNum = index === 6 ? 0 : index + 1;

                return (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishDays.includes(dayNum)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPublishDays([...publishDays, dayNum]);
                          setAllDays(false);
                        } else {
                          setPublishDays(publishDays.filter(d => d !== dayNum));
                        }
                      }}
                      className="w-4 h-4"
                      style={{ accentColor: '#dc2626' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-color)' }}>
                      {day}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 transition-opacity hover:opacity-80"
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            opacity: saving ? 0.5 : 1
          }}
        >
          {saving ? 'Saving...' : track ? 'Save Changes' : 'Create Track'}
        </button>
      </div>
    </div>
  );
}
