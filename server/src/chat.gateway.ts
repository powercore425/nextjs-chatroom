import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import type { Socket } from "socket.io";

const GENERAL_ID = "general";

interface StoredMessage {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  avatar?: string;
}

interface ConnectedUser {
  id: string;
  username: string;
  roomId: string;
  typing?: boolean;
  avatar?: string;
}

interface RoomInfo {
  id: string;
  name: string;
  creatorId: string;
  messages: StoredMessage[];
}

@WebSocketGateway({
  cors: {
    origin: [
      "http://localhost:3000",
      "https://nextjs-chatroom-pknw.vercel.app",
    ],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private rooms = new Map<string, RoomInfo>();
  private users = new Map<string, ConnectedUser>();

  constructor() {
    this.rooms.set(GENERAL_ID, {
      id: GENERAL_ID,
      name: "general",
      creatorId: "",
      messages: [],
    });
  }

  handleConnection(client: Socket) {
    this.users.set(client.id, { id: client.id, username: "", roomId: "" });
  }

  handleDisconnect(client: Socket) {
    const user = this.users.get(client.id);
    this.users.delete(client.id);
    if (user?.username && user.roomId) {
      this.broadcastUserLeft(user.roomId, user.username);
    }
  }

  private getRoomUserList(
    roomId: string,
  ): { id: string; username: string; avatar?: string }[] {
    return Array.from(this.users.values())
      .filter((u) => u.username && u.roomId === roomId)
      .map(({ id, username, avatar }) => ({ id, username, avatar }));
  }

  private getTypingUsernames(roomId: string): string[] {
    return Array.from(this.users.values())
      .filter((u) => u.roomId === roomId && u.typing)
      .map((u) => u.username);
  }

  private getRoomsList(): { id: string; name: string; creatorId: string }[] {
    return Array.from(this.rooms.values()).map((r) => ({
      id: r.id,
      name: r.name,
      creatorId: r.creatorId,
    }));
  }

  private broadcastUserLeft(roomId: string, username: string) {
    this.server.to(roomId).emit("user_left", {
      username,
      users: this.getRoomUserList(roomId),
    });
  }

  @SubscribeMessage("leave")
  handleLeave(@ConnectedSocket() client: Socket) {
    const user = this.users.get(client.id);
    if (!user?.username || !user.roomId) return { success: true };

    const roomId = user.roomId;
    const username = user.username;
    user.username = "";
    user.roomId = "";
    user.avatar = undefined;
    user.typing = false;
    client.leave(roomId);
    this.broadcastUserLeft(roomId, username);
    return { success: true };
  }

  @SubscribeMessage("join")
  handleJoin(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const username = (data?.username || "").trim();
    if (!username) return { success: false, error: "Username required" };

    const existing = this.users.get(client.id);
    if (existing?.username) {
      return { success: false, error: "Already joined" };
    }

    this.users.set(client.id, { id: client.id, username, roomId: GENERAL_ID });
    client.join(GENERAL_ID);

    const room = this.rooms.get(GENERAL_ID)!;
    client.emit("joined", {
      messages: room.messages,
      users: this.getRoomUserList(GENERAL_ID),
      rooms: this.getRoomsList(),
      currentRoomId: GENERAL_ID,
      currentRoomName: room.name,
    });
    client.broadcast.to(GENERAL_ID).emit("user_joined", {
      username,
      users: this.getRoomUserList(GENERAL_ID),
    });
    return { success: true };
  }

  @SubscribeMessage("join_room")
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.users.get(client.id);
    if (!user?.username) return { success: false, error: "Join first" };

    const roomId = (data?.roomId || "").trim();
    if (!roomId || !this.rooms.has(roomId)) {
      return { success: false, error: "Room not found" };
    }

    if (user.roomId === roomId) return { success: true };

    client.leave(user.roomId);
    this.broadcastUserLeft(user.roomId, user.username);

    user.roomId = roomId;
    user.typing = false;
    client.join(roomId);

    const room = this.rooms.get(roomId)!;
    client.broadcast.to(roomId).emit("user_joined", {
      username: user.username,
      users: this.getRoomUserList(roomId),
    });

    client.emit("room_joined", {
      roomId,
      roomName: room.name,
      creatorId: room.creatorId,
      messages: room.messages,
      users: this.getRoomUserList(roomId),
    });
    return { success: true };
  }

  @SubscribeMessage("create_room")
  handleCreateRoom(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.users.get(client.id);
    if (!user?.username) return { success: false, error: "Join first" };

    const name = (data?.name || "").trim();
    if (!name) return { success: false, error: "Room name required" };

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const id = slug === GENERAL_ID ? `room-${Date.now()}` : slug;
    const roomId = this.rooms.has(id)
      ? `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      : id;

    this.rooms.set(roomId, {
      id: roomId,
      name: name.slice(0, 80),
      creatorId: client.id,
      messages: [],
    });

    this.server.emit("rooms_updated", { rooms: this.getRoomsList() });

    client.emit("room_created", { roomId, roomName: name });
    this.handleJoinRoom({ roomId }, client);
    return { success: true, roomId };
  }

  @SubscribeMessage("delete_room")
  handleDeleteRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.users.get(client.id);
    if (!user?.username) return { success: false, error: "Join first" };

    const roomId = (data?.roomId || "").trim();
    if (roomId === GENERAL_ID)
      return { success: false, error: "Cannot delete general" };

    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: "Room not found" };
    if (room.creatorId !== client.id)
      return { success: false, error: "Only creator can delete" };

    const inRoom = Array.from(this.users.entries()).filter(
      ([, u]) => u.roomId === roomId,
    );
    this.rooms.delete(roomId);
    this.server.emit("rooms_updated", { rooms: this.getRoomsList() });
    this.server
      .to(roomId)
      .emit("room_deleted", { roomId, newRoomId: GENERAL_ID });

    const general = this.rooms.get(GENERAL_ID)!;
    for (const [socketId, u] of inRoom) {
      const sock = this.server.sockets.sockets.get(socketId);
      if (sock) {
        sock.leave(roomId);
        sock.join(GENERAL_ID);
        u.roomId = GENERAL_ID;
        u.typing = false;
        sock.emit("room_joined", {
          roomId: GENERAL_ID,
          roomName: general.name,
          messages: general.messages,
          users: this.getRoomUserList(GENERAL_ID),
        });
      }
    }

    return { success: true };
  }

  @SubscribeMessage("message")
  handleMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.users.get(client.id);
    if (!user?.username) return { success: false, error: "Join first" };

    const text = (data?.text || "").trim();
    if (!text) return { success: false };

    const room = this.rooms.get(user.roomId);
    if (!room) return { success: false, error: "No room" };

    const msg: StoredMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      username: user.username,
      text,
      timestamp: Date.now(),
      avatar: user.avatar,
    };
    room.messages.push(msg);
    if (room.messages.length > 500) room.messages = room.messages.slice(-500);

    this.server.to(user.roomId).emit("message", msg);
    return { success: true };
  }

  @SubscribeMessage("typing_start")
  handleTypingStart(@ConnectedSocket() client: Socket) {
    const user = this.users.get(client.id);
    if (!user?.username || !user.roomId) return;
    user.typing = true;
    client.broadcast
      .to(user.roomId)
      .emit("typing", { usernames: this.getTypingUsernames(user.roomId) });
  }

  @SubscribeMessage("typing_stop")
  handleTypingStop(@ConnectedSocket() client: Socket) {
    const user = this.users.get(client.id);
    if (!user?.username || !user.roomId) return;
    user.typing = false;
    client.broadcast
      .to(user.roomId)
      .emit("typing", { usernames: this.getTypingUsernames(user.roomId) });
  }

  @SubscribeMessage("update_username")
  handleUpdateUsername(
    @MessageBody() data: { username?: string; avatar?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.users.get(client.id);
    if (!user?.username || !user.roomId)
      return { success: false, error: "Join first" };

    const newUsername = (data?.username ?? user.username).trim();
    if (!newUsername) return { success: false, error: "Username required" };

    const oldUsername = user.username;
    user.username = newUsername;
    if (data?.avatar !== undefined) {
      user.avatar = data.avatar === "" ? undefined : data.avatar;
    }

    this.server.to(user.roomId).emit("username_updated", {
      socketId: client.id,
      oldUsername,
      newUsername,
      users: this.getRoomUserList(user.roomId),
    });
    return { success: true };
  }
}
