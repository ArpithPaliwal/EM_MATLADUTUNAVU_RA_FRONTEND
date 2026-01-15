export type ConversationBase = {
  _id: string;
  type: "direct" | "group";

  members: string[];
  createdBy: string;

  unreadCount: number;
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageCreatedAt?: string;
  conversationParticipantId?:string

  createdAt: string;
  updatedAt: string;
};
export type DirectConversation = ConversationBase & {
  type: "direct";

  partner: {
    _id: string;
    username: string;
    avatar?: string;
  };
};
export type GroupConversation = ConversationBase & {
  type: "group";

  groupName: string;

  groupAvatar?: {
    url: string;
    publicId?: string;
  };
};
export type ConversationListResponseDto =
  | DirectConversation
  | GroupConversation;
