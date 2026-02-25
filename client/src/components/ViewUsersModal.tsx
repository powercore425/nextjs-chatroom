'use client';

import type { User } from '@/lib/socket';

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ViewUsersModalProps {
  users: User[];
  onClose: () => void;
}

export function ViewUsersModal({ users, onClose }: ViewUsersModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm max-h-[85vh] sm:max-h-[80vh] flex flex-col bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Users in this room</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="p-4 overflow-y-auto space-y-2">
          {users.length === 0 ? (
            <li className="text-slate-500 dark:text-slate-400 text-sm">No users in this room.</li>
          ) : (
            users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2">
                <div
                  className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300 overflow-hidden shrink-0"
                  title={u.username}
                >
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(u.username)
                  )}
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">{u.username}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
