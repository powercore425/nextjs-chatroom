'use client';

import { useState, FormEvent, useRef } from 'react';

const MAX_AVATAR_BYTES = 80 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

interface EditProfileModalProps {
  currentUsername: string;
  currentAvatar?: string;
  onSave: (username: string, avatar?: string) => void;
  onClose: () => void;
}

export function EditProfileModal({ currentUsername, currentAvatar, onSave, onClose }: EditProfileModalProps) {
  const [value, setValue] = useState(currentUsername);
  const [avatar, setAvatar] = useState<string | undefined>(currentAvatar);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image (JPEG, PNG, WebP, or GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Length = Math.ceil((dataUrl.length * 3) / 4);
      if (base64Length > MAX_AVATAR_BYTES) {
        setAvatarError('Image is too large. Use a smaller image (under ~60KB).');
        return;
      }
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(undefined);
    setAvatarError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (name) {
      onSave(name, avatar);
      onClose();
    }
  };

  function getInitials(name: string) {
    return name
      .split(/\s+/)
      .map((s) => s[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Edit profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Avatar</label>
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-2xl font-medium text-slate-600 dark:text-slate-300 ring-2 ring-slate-200 dark:ring-slate-600">
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(value || currentUsername)
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Upload
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {avatarError && <p className="text-sm text-red-600 dark:text-red-400">{avatarError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Username"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 rounded-lg bg-blue-500 dark:bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
