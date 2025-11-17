'use client';

import { useState, useEffect } from 'react';
import IconPicker from './IconPicker';

interface SlideRowFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    row_type: string;
    icon_set: string[];
    theme_color: string;
    display_order: number;
    is_published: boolean;
    playlist_delay_seconds?: number;
    user_id?: string | null;
  };
  onSubmit: (data: SlideRowFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export interface SlideRowFormData {
  title: string;
  description: string;
  row_type: string;
  icon_set: string[];
  theme_color: string;
  display_order: number;
  is_published: boolean;
  playlist_delay_seconds: number;
  user_id: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const ROW_TYPES = ['ROUTINE', 'COURSE', 'TEACHING', 'CUSTOM'];

export default function SlideRowForm({ initialData, onSubmit, onCancel, isEdit = false }: SlideRowFormProps) {
  const [formData, setFormData] = useState<SlideRowFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    row_type: initialData?.row_type || 'ROUTINE',
    icon_set: initialData?.icon_set || [],
    theme_color: initialData?.theme_color || '#dc2626',
    display_order: initialData?.display_order || 0,
    is_published: initialData?.is_published || false,
    playlist_delay_seconds: initialData?.playlist_delay_seconds ?? 0,
    user_id: initialData?.user_id || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        if (data.status === 'success' && data.users) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.row_type) {
      newErrors.row_type = 'Row type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 rounded"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: `1px solid ${errors.title ? '#dc2626' : 'var(--border-color)'}`
          }}
          placeholder="Morning Meditation Sequence"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 rounded"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
          placeholder="A comprehensive 8-day meditation routine to cultivate mindfulness and inner peace"
        />
      </div>

      {/* Row Type */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Row Type *
        </label>
        {formData.row_type === 'QUICKSLIDE' ? (
          <>
            <div
              className="w-full px-4 py-2 rounded"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                opacity: 0.6
              }}
            >
              QUICKSLIDE (System-managed)
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
              Quick Slides row type cannot be changed
            </p>
          </>
        ) : (
          <select
            value={formData.row_type}
            onChange={(e) => setFormData({ ...formData, row_type: e.target.value })}
            className="w-full px-4 py-2 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              border: `1px solid ${errors.row_type ? '#dc2626' : 'var(--border-color)'}`
            }}
          >
            {ROW_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
        {errors.row_type && (
          <p className="text-red-600 text-sm mt-1">{errors.row_type}</p>
        )}
      </div>

      {/* Icon Picker */}
      <IconPicker
        selectedIcons={formData.icon_set}
        onChange={(icons) => setFormData({ ...formData, icon_set: icons })}
        maxIcons={3}
      />

      {/* Theme Color */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Theme Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={formData.theme_color}
            onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
            className="w-16 h-10 rounded cursor-pointer"
            style={{
              border: '1px solid var(--border-color)'
            }}
          />
          <input
            type="text"
            value={formData.theme_color}
            onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
            className="flex-1 px-4 py-2 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
            placeholder="#dc2626"
          />
        </div>
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Display Order
        </label>
        <input
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 rounded"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
          placeholder="0"
        />
        <p className="text-sm mt-1" style={{ color: 'var(--secondary-text)' }}>
          Lower numbers appear first
        </p>
      </div>

      {/* Playlist Delay */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Playlist Delay (seconds)
        </label>
        <select
          value={formData.playlist_delay_seconds}
          onChange={(e) => setFormData({ ...formData, playlist_delay_seconds: parseInt(e.target.value) })}
          className="w-full px-4 py-2 rounded"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          <option value={0}>0 seconds (no delay)</option>
          <option value={5}>5 seconds</option>
          <option value={10}>10 seconds</option>
          <option value={15}>15 seconds</option>
          <option value={20}>20 seconds</option>
          <option value={25}>25 seconds</option>
          <option value={30}>30 seconds</option>
          <option value={35}>35 seconds</option>
          <option value={40}>40 seconds</option>
          <option value={45}>45 seconds</option>
        </select>
        <p className="text-sm mt-1" style={{ color: 'var(--secondary-text)' }}>
          Pause duration between audio tracks in playlist mode
        </p>
      </div>

      {/* User Ownership */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Row Visibility
        </label>
        <select
          value={formData.user_id || ''}
          onChange={(e) => setFormData({ ...formData, user_id: e.target.value || null })}
          disabled={loadingUsers}
          className="w-full px-4 py-2 rounded"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          <option value="">Public (visible to everyone)</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              Private to {user.name} ({user.email})
            </option>
          ))}
        </select>
        <p className="text-sm mt-1" style={{ color: 'var(--secondary-text)' }}>
          {formData.user_id
            ? 'This row will only be visible to the selected user when logged in'
            : 'This row will be visible to all users'}
        </p>
      </div>

      {/* Published Status */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
          Status
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={formData.is_published}
              onChange={() => setFormData({ ...formData, is_published: true })}
              className="cursor-pointer"
            />
            <span style={{ color: 'var(--text-color)' }}>Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!formData.is_published}
              onChange={() => setFormData({ ...formData, is_published: false })}
              className="cursor-pointer"
            />
            <span style={{ color: 'var(--text-color)' }}>Draft</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            opacity: isSubmitting ? 0.5 : 1
          }}
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Slide Row' : 'Create Slide Row'}
        </button>
      </div>
    </form>
  );
}
