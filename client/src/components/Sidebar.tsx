'use client';

import { useState } from 'react';
import type { Room } from '@/lib/socket';
import { ThemeToggle } from './ThemeToggle';

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface SidebarProps {
  username: string;
  avatar?: string;
  connected: boolean;
  rooms: Room[];
  currentRoomId: string;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (name: string) => void;
  onEditProfile: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  username,
  avatar,
  connected,
  rooms,
  currentRoomId,
  onJoinRoom,
  onCreateRoom,
  onEditProfile,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newRoomName.trim();
    if (name) {
      onCreateRoom(name);
      setNewRoomName('');
      setShowCreate(false);
    }
  };

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40 w-72 max-w-[85vw] md:w-64 md:max-w-none shrink-0
          flex flex-col
          bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm md:shadow-none
          transition-transform duration-200 ease-out md:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Chat Rooms</h2>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="p-2 flex-1 overflow-y-auto min-h-0">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => onJoinRoom(room.id)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left font-medium transition-colors ${
                currentRoomId === room.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-slate-500 dark:text-slate-400">#</span>
              <span className="truncate">{room.name}</span>
            </button>
          ))}
          {showCreate ? (
            <form onSubmit={handleCreate} className="mt-2">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-500 dark:bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setNewRoomName(''); }}
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-2 w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <span className="text-lg">+</span>
              Create room
            </button>
          )}
        </nav>
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full p-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          title="Edit profile"
        >
          <div
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0 overflow-hidden"
            aria-hidden
          >
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(username)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{username}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span
                className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'}`}
              />
              {connected ? 'Online' : 'Offline'}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 transition-colors"
        >
          Log out
        </button>
      </aside>
    </>
  );
}
