'use client';

import { useRef, useEffect, useState, FormEvent, KeyboardEvent } from 'react';
import type { Message, User } from '@/lib/socket';
import { RoomMenu } from './RoomMenu';

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ChatRoomProps {
  roomName: string;
  messages: Message[];
  users: User[];
  typingUsernames: string[];
  isCreator: boolean;
  onSendMessage: (text: string) => void;
  onTyping: (typing: boolean) => void;
  onViewUsers: () => void;
  onDeleteRoom: () => void;
  onOpenSidebar: () => void;
}

export function ChatRoom({
  roomName,
  messages,
  users,
  typingUsernames,
  isCreator,
  onSendMessage,
  onTyping,
  onViewUsers,
  onDeleteRoom,
  onOpenSidebar,
}: ChatRoomProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    onSendMessage(t);
    setInput('');
    onTyping(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleChange = (value: string) => {
    setInput(value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
  };

  const typingLabel =
    typingUsernames.length === 0
      ? null
      : typingUsernames.length === 1
        ? `${typingUsernames[0]} is typing...`
        : `${typingUsernames.length} people are typing...`;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 flex min-h-0">
      <header className="shrink-0 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate"># {roomName}</h1>
          <span className="hidden xs:flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {users.length} {users.length === 1 ? 'User' : 'Users'} Online
          </span>
        </div>
        <RoomMenu
          users={users}
          isCreator={isCreator}
          roomName={roomName}
          onViewUsers={onViewUsers}
          onDeleteRoom={onDeleteRoom}
        />
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300 overflow-hidden"
              title={msg.username}
            >
              {msg.avatar ? (
                <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(msg.username)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{msg.username}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 break-words mt-0.5">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {typingLabel && (
        <div className="shrink-0 px-3 sm:px-6 py-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.975 3.975 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span className="truncate">{typingLabel}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="shrink-0 p-3 sm:p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-end gap-1 sm:gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:border-blue-500 dark:focus-within:border-blue-400">
          <button
            type="button"
            className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-l-xl"
            aria-label="Emoji"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[44px] max-h-32 py-2.5 px-0 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none text-base sm:text-inherit"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="m-1.5 px-3 sm:px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 text-white font-medium hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
