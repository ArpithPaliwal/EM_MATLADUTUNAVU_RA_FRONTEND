import { io, type Socket } from "socket.io-client";
import type { MessageResponseDto } from "../dto/messages.dto";

const SOCKET_URL = import.meta.env.VITE_API_BASE_CHAT_SOCKET as string;

export const socket: Socket = io(SOCKET_URL, {
  path: "/socket.io",
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// ---- State ----
let pendingConversationIds: string[] = [];
let lastActiveConversation: string | null = null;

// ---- Connection lifecycle ----
socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);

  if (pendingConversationIds.length) {
    socket.emit("conversation:join", pendingConversationIds);
  }

  if (lastActiveConversation) {
    socket.emit("conversation:active", lastActiveConversation);
  }
});

socket.on("disconnect", (reason) => {
  console.log("SOCKET DISCONNECTED:", reason);
});

socket.on("connect_error", (err) => {
  console.log("SOCKET CONNECT ERROR:", err.message);
});

// ---- Controls ----
export const connectSocket = (): void => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket.connected) socket.disconnect();
};


// ---- Conversation ----
export const joinConversations = (conversationIds: string[]) => {
  pendingConversationIds = conversationIds;

  if (socket.connected) {
    socket.emit("conversation:join", conversationIds);
  }
};

export const activeConversation = (conversationId: string) => {
  lastActiveConversation = conversationId;

  if (socket.connected) {
    socket.emit("conversation:active", conversationId);
  }
};

export const inActiveConversation = (conversationId: string) => {
  if (!socket.connected) return;

  if (lastActiveConversation === conversationId) {
    lastActiveConversation = null;
  }

  socket.emit("conversation:inactive", conversationId);
};

// ---- Message listeners ----
export const onMessageNew = (cb: (msg: MessageResponseDto) => void) => {
  socket.on("message:new", cb);
  return () => socket.off("message:new", cb);
};

export const onMessageDeleted = (
  cb: (payload: { messageId: string }) => void
) => {
  socket.on("message:deleted", cb);
  return () => socket.off("message:deleted", cb);
};

// ---- Message actions ----
export const deleteMessage = (payload: {
  messageId: string;
  senderId: string;
}) => {
  socket.emit("message:delete", payload);
};

type SendMessageAck =
  | { ok: true; message: MessageResponseDto }
  | { ok: false; error: string };

export const sendMessage = (
  payload: unknown,
  cb?: (msg: MessageResponseDto) => void,
  onError?: (err: unknown) => void
) => {
  if (!socket.connected) {
    onError?.("Socket not connected");
    return;
  }

  socket.emit("message:send", payload, (res: SendMessageAck) => {
    if (!res.ok) {
      onError?.(res.error);
      return;
    }
    cb?.(res.message);
  });
};

// ---- Unread ----
export const resetUnread = (conversationParticipantId?: string) => {
  if (!conversationParticipantId) return;
  socket.emit("conversationParticipant:unreadCount", conversationParticipantId);
};

export const onUnreadUpdate = (
  cb: (payload: {
    conversationId: string;
    incrementBy: number;
    text: string;
  }) => void
) => {
  socket.on("conversation:unreadUpdate", cb);
  return () => socket.off("conversation:unreadUpdate", cb);
};
