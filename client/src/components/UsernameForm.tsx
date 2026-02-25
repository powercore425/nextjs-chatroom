'use client';

import { useState, FormEvent } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface UsernameFormProps {
  onJoin: (username: string) => void;
  error: string | null;
  connected: boolean;
}

export function UsernameForm({ onJoin, error, connected }: UsernameFormProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onJoin(value.trim());
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">Chat Rooms</h1>
        <ThemeToggle />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter your username to join the chat.</p>
      {!connected && (
        <p className="text-amber-600 dark:text-amber-400 text-sm mb-4">Connecting to server…</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Username"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 sm:py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          disabled={!connected}
          autoFocus
        />
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={!connected || !value.trim()}
          className="w-full rounded-lg bg-blue-500 px-4 py-2.5 sm:py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
        >
          Join chat
        </button>
      </form>
    </div>
  );
}
