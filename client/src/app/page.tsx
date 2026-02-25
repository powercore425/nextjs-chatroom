'use client';

import { useState, useCallback } from 'react';
import { useChatSocket } from '@/hooks/useChatSocket';
import { ChatLayout } from '@/components/ChatLayout';
import { UsernameForm } from '@/components/UsernameForm';

export default function Home() {
  const chat = useChatSocket();
  const [showViewUsers, setShowViewUsers] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConfirmDeleteRoom = useCallback(() => {
    chat.deleteRoom(chat.currentRoomId);
    setShowDeleteConfirm(false);
  }, [chat.currentRoomId, chat.deleteRoom]);

  if (!chat.joined) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 sm:p-6">
        <UsernameForm
          onJoin={chat.join}
          error={chat.joinError}
          connected={chat.connected}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <ChatLayout
        username={chat.username}
        mySocketId={chat.mySocketId}
        rooms={chat.rooms}
        currentRoomId={chat.currentRoomId}
        currentRoomName={chat.currentRoomName}
        isCurrentRoomCreator={chat.isCurrentRoomCreator}
        messages={chat.messages}
        users={chat.users}
        typingUsernames={chat.typingUsernames}
        onSendMessage={chat.sendMessage}
        onTyping={chat.setTyping}
        onJoinRoom={chat.joinRoom}
        onCreateRoom={chat.createRoom}
        onDeleteRoom={chat.deleteRoom}
        onUpdateProfile={chat.updateProfile}
        onLogout={chat.logout}
        connected={chat.connected}
        showViewUsers={showViewUsers}
        showEditProfile={showEditProfile}
        showDeleteConfirm={showDeleteConfirm}
        onShowViewUsers={() => setShowViewUsers(true)}
        onShowEditProfile={() => setShowEditProfile(true)}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
        onCloseViewUsers={() => setShowViewUsers(false)}
        onCloseEditProfile={() => setShowEditProfile(false)}
        onCloseDeleteConfirm={() => setShowDeleteConfirm(false)}
        onConfirmDeleteRoom={handleConfirmDeleteRoom}
      />
    </main>
  );
}
