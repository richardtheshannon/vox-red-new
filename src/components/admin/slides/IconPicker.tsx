'use client';

import { useState } from 'react';

interface IconPickerProps {
  selectedIcons: string[];
  onChange: (icons: string[]) => void;
  maxIcons?: number;
}

const MATERIAL_ICONS = [
  'select_check_box',
  'check_circle_unread',
  'clock_arrow_up',
  'self_improvement',
  'spa',
  'fitness_center',
  'favorite',
  'lightbulb',
  'auto_awesome',
  'stars',
  'schedule',
  'event',
  'bookmark',
  'library_music',
  'headphones',
  'music_note',
  'audiotrack',
  'play_circle',
  'pause_circle',
  'stop_circle',
  'volume_up',
  'mic',
  'settings',
  'dashboard',
  'analytics',
  'monitoring',
  'library_books',
  'description',
  'folder',
  'inventory',
];

export default function IconPicker({ selectedIcons, onChange, maxIcons = 3 }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIcon = (iconName: string) => {
    if (selectedIcons.includes(iconName)) {
      onChange(selectedIcons.filter(i => i !== iconName));
    } else if (selectedIcons.length < maxIcons) {
      onChange([...selectedIcons, iconName]);
    }
  };

  const removeIcon = (iconName: string) => {
    onChange(selectedIcons.filter(i => i !== iconName));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
        Icon Set (Material Symbols - up to {maxIcons})
      </label>

      {/* Selected Icons Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIcons.map((icon) => (
          <div
            key={icon}
            className="flex items-center gap-2 px-3 py-2 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
              {icon}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-color)' }}>
              {icon}
            </span>
            <button
              type="button"
              onClick={() => removeIcon(icon)}
              className="ml-2 hover:opacity-70"
              style={{ color: 'var(--text-color)' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add Icon Button */}
      {selectedIcons.length < maxIcons && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
        >
          {isOpen ? 'Close Icon Picker' : '+ Add Icon'}
        </button>
      )}

      {/* Icon Grid */}
      {isOpen && (
        <div
          className="p-4 rounded max-h-64 overflow-y-auto"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div className="grid grid-cols-6 gap-3">
            {MATERIAL_ICONS.map((icon) => {
              const isSelectCheckBox = icon === 'select_check_box';
              const isCheckCircleUnread = icon === 'check_circle_unread';
              const isFunctionalIcon = isSelectCheckBox || isCheckCircleUnread;
              const isSelected = selectedIcons.includes(icon);

              // Determine color based on icon type
              const iconColor = isSelected
                ? 'white'
                : isCheckCircleUnread
                ? '#22c55e' // Green for temp unpublish
                : isSelectCheckBox
                ? '#ef4444' // Red for permanent unpublish (matching frontend)
                : 'var(--icon-color)';

              const borderColor = isFunctionalIcon ? (isCheckCircleUnread ? '#22c55e' : '#ef4444') : 'var(--border-color)';

              return (
                <button
                  key={icon}
                  type="button"
                  onClick={() => toggleIcon(icon)}
                  className="p-3 rounded transition-all hover:opacity-70"
                  style={{
                    backgroundColor: isSelected ? '#dc2626' : 'transparent',
                    color: iconColor,
                    border: `1px solid ${borderColor}`,
                    opacity: isSelected ? 1 : 0.7
                  }}
                  title={icon}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>
                    {icon}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
