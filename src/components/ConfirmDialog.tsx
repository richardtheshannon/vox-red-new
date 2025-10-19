'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isProcessing = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-lg shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-6 border-b"
          style={{
            borderBottomColor: 'var(--border-color)',
          }}
        >
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="material-symbols-outlined text-3xl hover:opacity-70 transition-opacity"
            style={{
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.5 : 1,
            }}
          >
            close
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-lg" style={{ color: 'var(--text-color)' }}>
            {message}
          </p>
        </div>

        {/* Footer Buttons */}
        <div
          className="flex justify-end gap-3 p-6 border-t"
          style={{
            borderTopColor: 'var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-2 rounded-lg font-semibold transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.5 : 1,
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-6 py-2 rounded-lg font-semibold transition-colors hover:opacity-90"
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.6 : 1,
            }}
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
