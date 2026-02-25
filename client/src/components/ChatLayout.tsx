'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatRoom } from './ChatRoom';
import { ViewUsersModal } from './ViewUsersModal';
import { EditProfileModal } from './EditProfileModal';
import { ConfirmModal } from './ConfirmModal';
import type { Message, User, Room } from '@/lib/socket';

interface ChatLayoutProps {
  username: string;
  mySocketId: string;
  rooms: Room[];
  currentRoomId: string;
  currentRoomName: string;
  isCurrentRoomCreator: boolean;
  messages: Message[];
  users: User[];
  typingUsernames: string[];
  onSendMessage: (text: string) => void;
  onTyping: (typing: boolean) => void;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (name: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onUpdateProfile: (username: string, avatar?: string) => void;
  onLogout: () => void;
  connected: boolean;
  showViewUsers: boolean;
  showEditProfile: boolean;
  showDeleteConfirm: boolean;
  onShowViewUsers: () => void;
  onShowEditProfile: () => void;
  onShowDeleteConfirm: () => void;
  onCloseViewUsers: () => void;
  onCloseEditProfile: () => void;
  onCloseDeleteConfirm: () => void;
  onConfirmDeleteRoom: () => void;
}

export function ChatLayout({
  username,
  mySocketId,
  rooms,
  currentRoomId,
  currentRoomName,
  isCurrentRoomCreator,
  messages,
  users,
  typingUsernames,
  onSendMessage,
  onTyping,
  onJoinRoom,
  onCreateRoom,
  onDeleteRoom,
  onUpdateProfile,
  onLogout,
  connected,
  showViewUsers,
  showEditProfile,
  showDeleteConfirm,
  onShowViewUsers,
  onShowEditProfile,
  onShowDeleteConfirm,
  onCloseViewUsers,
  onCloseEditProfile,
  onCloseDeleteConfirm,
  onConfirmDeleteRoom,
}: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUserAvatar = users.find((u) => u.id === mySocketId)?.avatar;

  const handleJoinRoom = (roomId: string) => {
    onJoinRoom(roomId);
    setSidebarOpen(false);
  };

  return (
    <>
      <Sidebar
        username={username}
        avatar={currentUserAvatar}
        connected={connected}
        rooms={rooms}
        currentRoomId={currentRoomId}
        onJoinRoom={handleJoinRoom}
        onCreateRoom={onCreateRoom}
        onEditProfile={onShowEditProfile}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ChatRoom
        roomName={currentRoomName}
        messages={messages}
        users={users}
        typingUsernames={typingUsernames}
        isCreator={isCurrentRoomCreator}
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onViewUsers={onShowViewUsers}
        onDeleteRoom={onShowDeleteConfirm}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      {showViewUsers && <ViewUsersModal users={users} onClose={onCloseViewUsers} />}
      {showEditProfile && (
        <EditProfileModal
          currentUsername={username}
          currentAvatar={currentUserAvatar}
          onSave={onUpdateProfile}
          onClose={onCloseEditProfile}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete room"
          message={`Are you sure you want to delete "# ${currentRoomName}"? Everyone will be moved to # general.`}
          confirmLabel="Delete"
          danger
          onConfirm={onConfirmDeleteRoom}
          onCancel={onCloseDeleteConfirm}
        />
      )}
    </>
  );
}
