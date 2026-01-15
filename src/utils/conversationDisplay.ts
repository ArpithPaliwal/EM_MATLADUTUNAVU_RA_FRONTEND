import type { ConversationListResponseDto } from "../dto/chatListResponse.dto";

export function getConversationDisplay(conversation: ConversationListResponseDto) {
  const name =
    conversation.type === "direct"
      ? conversation.partner?.username
      : conversation.groupName;

  const avatar =
    conversation.type === "direct"
      ? conversation.partner?.avatar
      : conversation.groupAvatar?.url;

  return {
    name: name ?? "Unknown",
    avatar: avatar ?? "/default-avatar.png",
    type:conversation.type,
    _id:conversation._id
    
  };
}
