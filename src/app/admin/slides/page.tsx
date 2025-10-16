'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import SlideRowList from '@/components/admin/slides/SlideRowList';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { parseMarkdownCourse, getCourseTitle, truncateText, type ParsedSlide } from '@/lib/parseMarkdownCourse';

interface SlideRow {
  id: string;
  title: string;
  description: string;
  row_type: string;
  slide_count: number;
  is_published: boolean;
  icon_set: string[];
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export default function AdminSlidesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedSlides, setParsedSlides] = useState<ParsedSlide[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [audioBaseUrl, setAudioBaseUrl] = useState('');
  const [audioUrlError, setAudioUrlError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedSlideRowId, setImportedSlideRowId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/slides/rows');

      if (!response.ok) {
        throw new Error('Failed to fetch slide rows');
      }

      const data = await response.json();
      setRows(data.rows || []);
    } catch (err) {
      console.error('Error fetching slide rows:', err);
      setError(err instanceof Error ? err.message : 'Failed to load slide rows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/slides/rows/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide row');
      }

      await fetchRows();
    } catch (err) {
      console.error('Error deleting slide row:', err);
      alert('Failed to delete slide row. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    // Trigger file input
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      setParseError('Please select a markdown file (.md or .markdown)');
      return;
    }

    setImportFile(file);
    setParseError(null);

    // Read and parse the file
    try {
      const text = await file.text();
      const result = parseMarkdownCourse(text);

      if (result.error) {
        setParseError(result.error);
        setParsedSlides([]);
        setCourseTitle('');
      } else {
        setParsedSlides(result.slides);
        setCourseTitle(getCourseTitle(file.name));
        setParseError(null);
      }
    } catch (err) {
      console.error('Error reading file:', err);
      setParseError('Failed to read file. Please try again.');
      setParsedSlides([]);
      setCourseTitle('');
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setParsedSlides([]);
    setCourseTitle('');
    setParseError(null);
    setAudioBaseUrl('');
    setAudioUrlError(null);
    setImporting(false);
    setImportProgress(null);
    setImportSuccess(false);
    setImportedSlideRowId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateAudioUrl = (baseUrl: string, slideIndex: number): string => {
    const paddedNumber = String(slideIndex + 1).padStart(3, '0');
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/${paddedNumber}.mp3`;
  };

  const validateAudioBaseUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleAudioBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAudioBaseUrl(url);

    if (url && !validateAudioBaseUrl(url)) {
      setAudioUrlError('URL must start with http:// or https://');
    } else {
      setAudioUrlError(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importFile || parsedSlides.length === 0) return;

    // Validate audio base URL before sending
    if (audioBaseUrl && !validateAudioBaseUrl(audioBaseUrl)) {
      setAudioUrlError('URL must start with http:// or https://');
      return;
    }

    setImporting(true);
    setImportProgress(`Importing ${parsedSlides.length} slides...`);

    try {
      const markdown = await importFile.text();

      const response = await fetch('/api/slides/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown,
          filename: importFile.name,
          audioBaseUrl: audioBaseUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to import course');
      }

      // Success!
      setImportProgress(null);
      setImportSuccess(true);
      setImportedSlideRowId(data.slideRowId);

      // Refresh the slide row list
      await fetchRows();
    } catch (err) {
      console.error('Import error:', err);
      setImporting(false);
      setImportProgress(null);
      setParseError(err instanceof Error ? err.message : 'Failed to import course');
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        {/* Header */}
        <AdminTopIconBar />

        {/* Main Content Area */}
        <div className="absolute inset-0" style={{ padding: '50px' }}>
          <div className="h-full flex gap-4">
            {/* Left Sidebar */}
            <AdminLeftIconBar />

            {/* Quick Actions Column */}
            <div style={{ width: '12.5%', minWidth: '150px', maxWidth: '200px' }} className="flex-shrink-0">
              <AdminQuickActions />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--secondary-text)' }}>
                  <span
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => router.push('/admin')}
                  >
                    Admin Dashboard
                  </span>
                  <span>&gt;</span>
                  <span style={{ color: 'var(--text-color)' }}>Slide Management</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Slide Management
                </h1>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-color)' }}>Loading slide rows...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div
                  className="p-4 rounded mb-6"
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5'
                  }}
                >
                  <p className="font-semibold">Error loading slide rows</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={fetchRows}
                    className="mt-2 px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#991b1b',
                      color: 'white'
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Slide Row List */}
              {!loading && !error && (
                <SlideRowList
                  rows={rows}
                  onDelete={handleDelete}
                  onRefresh={fetchRows}
                  onImportClick={handleImportClick}
                />
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </main>

            {/* Right Sidebar */}
            <AdminRightIconBar isExpanded={sidebarExpanded} />
          </div>
        </div>

        {/* Footer */}
        <AdminBottomIconBar onMenuClick={toggleSidebar} />

        {/* Import Preview Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              style={{
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Modal Header */}
              <div
                className="p-6 border-b"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Import Course from Markdown
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--secondary-text)' }}>
                  {importFile ? `File: ${importFile.name}` : 'Select a markdown file to import'}
                </p>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Parse Error */}
                {parseError && (
                  <div
                    className="p-4 rounded mb-4"
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fca5a5'
                    }}
                  >
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{parseError}</p>
                  </div>
                )}

                {/* Audio Base URL Input */}
                {parsedSlides.length > 0 && (
                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-color)' }}
                    >
                      Audio Base URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={audioBaseUrl}
                      onChange={handleAudioBaseUrlChange}
                      placeholder="https://example.com/media/mp3s/course-name"
                      className="w-full px-3 py-2 rounded transition-colors"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        border: audioUrlError ? '1px solid #dc2626' : '1px solid var(--border-color)'
                      }}
                    />
                    {audioUrlError && (
                      <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                        {audioUrlError}
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                      If provided, audio URLs will be auto-generated as 001.mp3, 002.mp3, etc.
                    </p>
                  </div>
                )}

                {/* Preview */}
                {parsedSlides.length > 0 && (
                  <div className="space-y-6">
                    {/* Course Info */}
                    <div
                      className="p-4 rounded"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
                          Course Title: {courseTitle}
                        </h3>
                        <span
                          className="text-sm px-3 py-1 rounded"
                          style={{
                            backgroundColor: '#16a34a',
                            color: 'white'
                          }}
                        >
                          {parsedSlides.length} slides
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                        A new slide row will be created with the title above
                      </p>
                    </div>

                    {/* Slides Preview */}
                    <div>
                      <h4 className="text-md font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                        Slides Preview
                      </h4>
                      <div className="space-y-3">
                        {parsedSlides.map((slide, index) => {
                          const audioUrl = audioBaseUrl && validateAudioBaseUrl(audioBaseUrl)
                            ? generateAudioUrl(audioBaseUrl, index)
                            : null;

                          return (
                            <div
                              key={index}
                              className="p-4 rounded"
                              style={{
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--border-color)'
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className="text-sm font-bold px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    minWidth: '40px',
                                    textAlign: 'center'
                                  }}
                                >
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <h5 className="font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                                    {slide.title}
                                  </h5>
                                  {slide.body ? (
                                    <p className="text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
                                      {truncateText(slide.body, 100)}
                                    </p>
                                  ) : (
                                    <p className="text-sm italic mb-2" style={{ color: 'var(--secondary-text)' }}>
                                      (No body content)
                                    </p>
                                  )}
                                  {audioUrl && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="material-symbols-outlined text-base" style={{ color: '#16a34a', fontWeight: 100 }}>
                                        volume_up
                                      </span>
                                      <p className="text-xs font-mono" style={{ color: '#16a34a' }}>
                                        {audioUrl}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* No file selected */}
                {!importFile && !parseError && (
                  <div className="text-center py-12">
                    <p style={{ color: 'var(--secondary-text)' }}>
                      Click &quot;Select File&quot; to choose a markdown file to import
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                className="p-6 border-t flex justify-between items-center"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {/* Left side: Progress/Success indicator */}
                <div className="flex-1">
                  {importProgress && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" style={{ borderColor: '#dc2626' }}></div>
                      <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                        {importProgress}
                      </p>
                    </div>
                  )}
                  {importSuccess && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl" style={{ color: '#16a34a', fontWeight: 100 }}>
                        check_circle
                      </span>
                      <p className="text-sm font-medium" style={{ color: '#16a34a' }}>
                        Successfully imported {parsedSlides.length} slides!
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side: Action buttons */}
                <div className="flex gap-3">
                  {!importSuccess ? (
                    <>
                      <button
                        onClick={handleCloseImportModal}
                        disabled={importing}
                        className="px-4 py-2 rounded transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          color: 'var(--text-color)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        Cancel
                      </button>
                      {!importFile && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={importing}
                          className="px-4 py-2 rounded transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: '#16a34a',
                            color: 'white'
                          }}
                        >
                          Select File
                        </button>
                      )}
                      {parsedSlides.length > 0 && (
                        <button
                          onClick={handleConfirmImport}
                          disabled={importing || !!audioUrlError}
                          className="px-4 py-2 rounded transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white'
                          }}
                        >
                          {importing ? 'Importing...' : 'Confirm Import'}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCloseImportModal}
                        className="px-4 py-2 rounded transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          color: 'var(--text-color)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          if (importedSlideRowId) {
                            router.push(`/admin/slides/${importedSlideRowId}`);
                          }
                        }}
                        className="px-4 py-2 rounded transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white'
                        }}
                      >
                        View Slide Row
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
