'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import AudioUploader from './AudioUploader';
import SlidePreview from './SlidePreview';
import IconPicker from './IconPicker';
import { Slide } from '@/lib/queries/slides';

interface SlideRow {
  id: string;
  title: string;
  row_type: string;
}

interface SlideEditorProps {
  row: SlideRow;
  slide: Slide | null;
  isNewSlide: boolean;
  onSave: (slideData: Partial<Slide>) => Promise<void>;
  onCancel: () => void;
}

export default function SlideEditor({ row, slide, isNewSlide, onSave, onCancel }: SlideEditorProps) {
  const [title, setTitle] = useState(slide?.title || '');
  const [subtitle, setSubtitle] = useState(slide?.subtitle || '');
  const [audioUrl, setAudioUrl] = useState(slide?.audio_url || '');
  const [imageUrl, setImageUrl] = useState(slide?.image_url || '');
  const [videoUrl, setVideoUrl] = useState(slide?.video_url || '');
  const [layoutType, setLayoutType] = useState<'STANDARD' | 'OVERFLOW' | 'MINIMAL'>(slide?.layout_type || 'STANDARD');
  const [position, setPosition] = useState(slide?.position || 1);
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issue
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your slide content here... You can use formatting, lists, and links.',
      }),
    ],
    content: slide?.body_content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
        style: 'min-height: 200px; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background-color: var(--bg-color); color: var(--text-color);',
      },
    },
  });

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!editor) {
      setError('Editor not initialized');
      return;
    }

    const bodyContent = editor.getHTML();

    if (!bodyContent.trim() || bodyContent === '<p></p>') {
      setError('Body content is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const slideData: Partial<Slide> = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        body_content: bodyContent,
        audio_url: audioUrl || undefined,
        image_url: imageUrl || undefined,
        video_url: videoUrl || undefined,
        layout_type: layoutType,
        position: isNewSlide ? position : slide?.position,
      };

      await onSave(slideData);
    } catch (err) {
      console.error('Error saving slide:', err);
      setError(err instanceof Error ? err.message : 'Failed to save slide');
      setSaving(false);
    }
  };

  const handleAudioUpload = (url: string) => {
    setAudioUrl(url);
  };

  const getPreviewData = (): Slide => {
    return {
      id: slide?.id || 'preview',
      slide_row_id: row.id,
      title,
      subtitle: subtitle || undefined,
      body_content: editor?.getHTML() || '',
      audio_url: audioUrl || undefined,
      image_url: imageUrl || undefined,
      video_url: videoUrl || undefined,
      position,
      layout_type: layoutType,
      view_count: slide?.view_count || 0,
      completion_count: slide?.completion_count || 0,
      created_at: slide?.created_at || new Date(),
      updated_at: slide?.updated_at || new Date(),
    };
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div
          className="p-4 rounded"
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

      {/* Two Column Layout: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <div
            className="p-6 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
              Slide Details
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
                placeholder="Enter slide title..."
                className="w-full px-4 py-2 rounded"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Enter slide subtitle..."
                className="w-full px-4 py-2 rounded"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            {/* Body Content - Rich Text Editor */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                Body Content *
              </label>

              {/* Editor Toolbar */}
              {editor && (
                <div
                  className="flex flex-wrap gap-2 p-2 rounded-t"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderBottom: 'none'
                  }}
                >
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-red-600 text-white' : ''}`}
                    style={{
                      backgroundColor: editor.isActive('bold') ? '#dc2626' : 'var(--bg-color)',
                      color: editor.isActive('bold') ? 'white' : 'var(--text-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-red-600 text-white' : ''}`}
                    style={{
                      backgroundColor: editor.isActive('italic') ? '#dc2626' : 'var(--bg-color)',
                      color: editor.isActive('italic') ? 'white' : 'var(--text-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <em>I</em>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-red-600 text-white' : ''}`}
                    style={{
                      backgroundColor: editor.isActive('heading', { level: 2 }) ? '#dc2626' : 'var(--bg-color)',
                      color: editor.isActive('heading', { level: 2 }) ? 'white' : 'var(--text-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    H2
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-red-600 text-white' : ''}`}
                    style={{
                      backgroundColor: editor.isActive('heading', { level: 3 }) ? '#dc2626' : 'var(--bg-color)',
                      color: editor.isActive('heading', { level: 3 }) ? 'white' : 'var(--text-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    H3
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-red-600 text-white' : ''}`}
                    style={{
                      backgroundColor: editor.isActive('bulletList') ? '#dc2626' : 'var(--bg-color)',
                      color: editor.isActive('bulletList') ? 'white' : 'var(--text-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    • List
                  </button>
                  <button
                    onClick={() => {
                      const url = window.prompt('Enter link URL:');
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      }
                    }}
                    className="px-3 py-1 rounded text-sm"
                    style={{
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    Link
                  </button>
                </div>
              )}

              {/* Editor Content */}
              <EditorContent editor={editor} />
            </div>

            {/* Layout Type */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                Layout Type
              </label>
              <select
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value as 'STANDARD' | 'OVERFLOW' | 'MINIMAL')}
                className="w-full px-4 py-2 rounded"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <option value="STANDARD">Standard (Centered content)</option>
                <option value="OVERFLOW">Overflow (Scrollable content)</option>
                <option value="MINIMAL">Minimal (Title + audio only)</option>
              </select>
            </div>

            {/* Position (for new slides) */}
            {isNewSlide && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Position
                </label>
                <input
                  type="number"
                  min="1"
                  value={position}
                  onChange={(e) => setPosition(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded"
                  style={{
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                  Lower numbers appear first
                </p>
              </div>
            )}
          </div>

          {/* Media Upload Section */}
          <div
            className="p-6 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
              Media Files
            </h2>

            {/* Audio Upload */}
            <AudioUploader
              currentAudioUrl={audioUrl}
              onUploadComplete={handleAudioUpload}
              rowId={row.id}
            />

            {/* Image URL (simple text input for now) */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                Background Image URL (Optional)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/media/slides/background.jpg"
                className="w-full px-4 py-2 rounded"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            {/* YouTube Video URL */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                YouTube Video URL (Optional)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 rounded"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                Supports: youtube.com/watch?v=, youtu.be/, or video ID
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div
          className="p-6 rounded"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
            Live Preview
          </h2>
          <SlidePreview slide={getPreviewData()} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-[50px]">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 rounded transition-opacity hover:opacity-80"
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
          className="px-6 py-3 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            opacity: saving ? 0.5 : 1
          }}
        >
          {saving ? 'Saving...' : isNewSlide ? 'Create Slide' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
