'use client';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">{message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onCancel(); }}
            className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-white ${
              danger
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
