'use client';

import { SpaTrack } from '@/lib/queries/spaTracks';

interface SpaTrackListProps {
  tracks: SpaTrack[];
  onEdit: (track: SpaTrack) => void;
  onDelete: (trackId: string) => void;
}

export default function SpaTrackList({ tracks, onEdit, onDelete }: SpaTrackListProps) {
  const formatTime = (timeStr: string | null | undefined): string => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getDayNames = (dayNumbers: number[]): string => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNumbers.map(num => dayNames[num] || '?').join(', ');
  };

  if (tracks.length === 0) {
    return (
      <div
        className="p-8 text-center"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        <p style={{ color: 'var(--text-color)' }}>No spa tracks found. Add your first track to get started!</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)'
      }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Order
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Title
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Audio URL
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Schedule
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Random
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => {
            const publishDays = track.publish_days ? JSON.parse(track.publish_days) : [];
            const hasSchedule = track.publish_time_start || track.publish_time_end || publishDays.length > 0;

            return (
              <tr
                key={track.id}
                style={{ borderBottom: index < tracks.length - 1 ? '1px solid var(--border-color)' : 'none' }}
              >
                <td className="px-4 py-3" style={{ color: 'var(--text-color)' }}>
                  <span
                    className="inline-block px-3 py-1 text-sm font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)'
                    }}
                  >
                    {track.display_order}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold" style={{ color: 'var(--text-color)' }}>
                    {track.title}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={track.audio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: '#dc2626' }}
                  >
                    {track.audio_url.length > 40 ? `${track.audio_url.substring(0, 40)}...` : track.audio_url}
                  </a>
                </td>
                <td className="px-4 py-3">
                  {track.is_published ? (
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: '#22c55e',
                        color: 'white'
                      }}
                    >
                      Published
                    </span>
                  ) : (
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white'
                      }}
                    >
                      Unpublished
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {hasSchedule ? (
                    <div className="text-xs" style={{ color: 'var(--secondary-text)' }}>
                      {track.publish_time_start && <div>Start: {formatTime(track.publish_time_start)}</div>}
                      {track.publish_time_end && <div>End: {formatTime(track.publish_time_end)}</div>}
                      {publishDays.length > 0 && <div>Days: {getDayNames(publishDays)}</div>}
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--secondary-text)' }}>
                      Always
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {track.is_random ? (
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white'
                      }}
                    >
                      Random
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--secondary-text)' }}>
                      Sequential
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(track)}
                      className="px-3 py-1 text-sm transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${track.title}"?`)) {
                          onDelete(track.id);
                        }
                      }}
                      className="px-3 py-1 text-sm transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
