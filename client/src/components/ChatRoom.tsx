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

      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-4 pb-4 pt-2 sm:px-6 sm:pb-5 sm:pt-3 bg-white dark:bg-slate-800/95 border-t border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 rounded-[1.25rem] border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)] focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:shadow-[0_0_0_2px_rgba(59,130,246,0.2)] dark:focus-within:shadow-[0_0_0_2px_rgba(96,165,250,0.25)] transition-[border-color,box-shadow] duration-150">
          <button
            type="button"
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600/80 transition-colors"
            aria-label="Emoji"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[2.75rem] max-h-32 py-2.5 px-0 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none text-[15px] sm:text-base leading-[1.4]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 h-10 px-5 rounded-full bg-blue-500 dark:bg-blue-500 text-white font-semibold text-[15px] shadow-sm hover:bg-blue-600 dark:hover:bg-blue-600 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all duration-150"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
