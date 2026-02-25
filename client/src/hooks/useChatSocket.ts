'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createSocket, type Message, type User, type Room } from '@/lib/socket';

export function useChatSocket() {
  const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsernameState] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsernames, setTypingUsernames] = useState<string[]>([]);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [currentRoomName, setCurrentRoomName] = useState<string>('');
  const [currentRoomCreatorId, setCurrentRoomCreatorId] = useState<string>('');
  const [mySocketId, setMySocketId] = useState<string>('');
  const currentRoomIdRef = useRef<string>('');
  currentRoomIdRef.current = currentRoomId;

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setMySocketId(socket.id ?? '');
    });
    socket.on('disconnect', () => {
      setConnected(false);
      setJoined(false);
      setTypingUsernames([]);
    });

    socket.on('joined', (data: { messages: Message[]; users: User[]; rooms: Room[]; currentRoomId: string; currentRoomName: string }) => {
      setMessages(data.messages ?? []);
      setUsers(data.users ?? []);
      setRooms(data.rooms ?? []);
      setCurrentRoomId(data.currentRoomId ?? '');
      setCurrentRoomName(data.currentRoomName ?? '');
      const r = (data.rooms ?? []).find((x) => x.id === data.currentRoomId);
      setCurrentRoomCreatorId(r?.creatorId ?? '');
      setJoined(true);
      setJoinError(null);
    });

    socket.on('room_joined', (data: { roomId: string; roomName: string; creatorId?: string; messages: Message[]; users: User[] }) => {
      setCurrentRoomId(data.roomId ?? '');
      setCurrentRoomName(data.roomName ?? '');
      if (data.creatorId !== undefined) setCurrentRoomCreatorId(data.creatorId);
      setMessages(data.messages ?? []);
      setUsers(data.users ?? []);
      setTypingUsernames([]);
    });

    socket.on('rooms_updated', (data: { rooms: Room[] }) => {
      setRooms(data.rooms ?? []);
      const list = data.rooms ?? [];
      const r = list.find((x) => x.id === currentRoomIdRef.current);
      setCurrentRoomCreatorId(r?.creatorId ?? '');
    });

    socket.on('room_deleted', (data: { roomId: string; newRoomId: string }) => {
      setRooms((prev) => prev.filter((r) => r.id !== data.roomId));
      setCurrentRoomId((prev) => {
        if (prev === data.roomId) {
          setCurrentRoomName('general');
          setCurrentRoomCreatorId('');
          return data.newRoomId;
        }
        return prev;
      });
    });

    socket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_joined', (data: { users?: User[] }) => {
      if (data?.users) setUsers(data.users);
    });

    socket.on('user_left', (data: { users?: User[] }) => {
      if (data?.users) setUsers(data.users);
    });

    socket.on('typing', (data: { usernames: string[] }) => {
      setTypingUsernames(data?.usernames ?? []);
    });

    socket.on('username_updated', (data: { socketId: string; oldUsername: string; newUsername: string; users: User[] }) => {
      setUsers(data?.users ?? []);
      if (socket.id === data.socketId) setUsernameState(data.newUsername);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const join = useCallback((name: string) => {
    const s = socketRef.current;
    if (!s?.connected) return;
    setJoinError(null);
    s.emit('join', { username: name.trim() }, (res: { success?: boolean; error?: string }) => {
      if (res?.success) {
        setUsernameState(name.trim());
      } else {
        setJoinError(res?.error || 'Failed to join');
      }
    });
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('join_room', { roomId }, (res: { success?: boolean; error?: string }) => {
      if (!res?.success) console.error(res?.error);
    });
  }, []);

  const createRoom = useCallback((name: string) => {
    socketRef.current?.emit('create_room', { name: name.trim() }, (res: { success?: boolean; error?: string }) => {
      if (!res?.success) console.error(res?.error);
    });
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('delete_room', { roomId }, (res: { success?: boolean; error?: string }) => {
      if (!res?.success) console.error(res?.error);
    });
  }, []);

  const sendMessage = useCallback((text: string) => {
    socketRef.current?.emit('message', { text: text.trim() });
  }, []);

  const setTyping = useCallback((typing: boolean) => {
    if (typing) socketRef.current?.emit('typing_start');
    else socketRef.current?.emit('typing_stop');
  }, []);

  const updateProfile = useCallback((newUsername: string, avatar?: string) => {
    socketRef.current?.emit(
      'update_username',
      { username: newUsername.trim(), avatar: avatar ?? undefined },
      (res: { success?: boolean; error?: string }) => {
        if (res?.success) setUsernameState(newUsername.trim());
      },
    );
  }, []);

  const logout = useCallback(() => {
    socketRef.current?.emit('leave', {}, () => {
      setJoined(false);
      setUsernameState('');
      setMessages([]);
      setUsers([]);
      setTypingUsernames([]);
      setRooms([]);
      setCurrentRoomId('');
      setCurrentRoomName('');
      setCurrentRoomCreatorId('');
    });
  }, []);

  const isCurrentRoomCreator = mySocketId ? currentRoomCreatorId === mySocketId : false;

  return {
    connected,
    username,
    joined,
    messages,
    users,
    typingUsernames,
    joinError,
    rooms,
    currentRoomId,
    currentRoomName,
    isCurrentRoomCreator,
    mySocketId,
    join,
    joinRoom,
    createRoom,
    deleteRoom,
    sendMessage,
    setTyping,
    updateProfile,
    logout,
  };
}
