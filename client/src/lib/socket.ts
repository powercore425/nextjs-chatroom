import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function createSocket(): Socket {
  return io(WS_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
}

export type Message = {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  avatar?: string;
};

export type User = { id: string; username: string; avatar?: string };

export type Room = { id: string; name: string; creatorId: string };
