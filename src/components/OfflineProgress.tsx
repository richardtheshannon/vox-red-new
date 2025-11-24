'use client';

import { useEffect } from 'react';
import type { OfflineProgress } from '@/lib/offlineManager';

interface OfflineProgressProps {
  progress: OfflineProgress;
  onClose?: () => void;
}

export default function OfflineProgressModal({ progress, onClose }: OfflineProgressProps) {
  const { status, progress: percent, message, cachedAssets, totalAssets } = progress;

  // Auto-close after 3 seconds when complete
  useEffect(() => {
    if (status === 'complete' && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  // Don't show if idle
  if (status === 'idle') return null;

  const getStatusColor = () => {
    switch (status) {
      case 'downloading':
        return '#3b82f6'; // blue
      case 'complete':
        return '#22c55e'; // green
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'downloading':
        return 'download';
      case 'complete':
        return 'check_circle';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}
    >
      <div
        className="bg-white shadow-lg flex flex-col items-center p-8"
        style={{
          minWidth: '320px',
          maxWidth: '480px',
          backgroundColor: 'var(--content-bg)',
          color: 'var(--text-color)'
        }}
      >
        {/* Icon */}
        <span
          className="material-symbols-rounded mb-4"
          style={{
            fontSize: '48px',
            color: getStatusColor(),
            fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"
          }}
        >
          {getStatusIcon()}
        </span>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">
          {status === 'downloading' && 'Downloading for Offline'}
          {status === 'complete' && 'Ready for Offline Use'}
          {status === 'error' && 'Download Failed'}
        </h2>

        {/* Message */}
        <p className="text-center mb-4 opacity-80">{message}</p>

        {/* Progress Bar (only show when downloading) */}
        {status === 'downloading' && (
          <div className="w-full mb-4">
            <div
              className="w-full h-2 bg-gray-200 overflow-hidden mb-2"
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${percent}%`,
                  backgroundColor: getStatusColor()
                }}
              />
            </div>
            <div className="flex justify-between text-sm opacity-70">
              <span>{percent}%</span>
              <span>
                {cachedAssets} / {totalAssets} assets
              </span>
            </div>
          </div>
        )}

        {/* Success info */}
        {status === 'complete' && (
          <div className="text-center text-sm opacity-70 mb-4">
            <p>
              Downloaded {totalAssets} assets
            </p>
            <p className="mt-1">Content available offline</p>
          </div>
        )}

        {/* Error actions */}
        {status === 'error' && onClose && (
          <button
            onClick={onClose}
            className="px-6 py-2 text-white transition-colors"
            style={{
              backgroundColor: '#ef4444'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            Close
          </button>
        )}

        {/* Auto-close notice for success */}
        {status === 'complete' && (
          <p className="text-xs opacity-50 mt-2">Closing automatically...</p>
        )}
      </div>
    </div>
  );
}
