
import type { ConversationListResponseDto } from "../../dto/chatListResponse.dto";
import { getConversationDisplay } from "../../utils/conversationDisplay";
import { resetUnread } from "../../Services/socket";
import { useQueryClient } from "@tanstack/react-query";
type Props = {
  conversation: ConversationListResponseDto;
  onSelect: (conversation: ConversationListResponseDto) => void;
  isActive: boolean;
};

export default function ChatListItem({
  conversation,
  onSelect,
  isActive,
}: Props) {
  const { name, avatar } = getConversationDisplay(conversation);
  const lastMessage = conversation.lastMessageText ?? "start the conversation";
  const queryClient = useQueryClient();

  const resetUnreadAndUpdateUi = () => {
  if (conversation.unreadCount === 0) return;

  resetUnread(conversation.conversationParticipantId);

  queryClient.setQueryData<ConversationListResponseDto[]>(
    ["conversations"],
    (old = []) =>
      old.map((c) =>
        c.conversationParticipantId === conversation.conversationParticipantId
          ? { ...c, unreadCount: 0 }
          : c
      )
  );
};
  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer rounded-2xl w-full
        ${isActive ? "bg-secondary" : "hover:bg-blue-400"}`}
      onClick={() => {
        onSelect(conversation);
        resetUnreadAndUpdateUi();
      }}
    >
      {/* Avatar */}
      <img
        src={avatar}
        alt={name}
        className="w-12 h-12 rounded-full object-cover"
      />

      {/* Texts */}
      <div className="flex-1">
        <div className="font-semibold text-primary">{name}</div>
        <div className="text-sm text-secondary truncate">{lastMessage}</div>
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <span className="bg-secondary text-white text-xs px-2 py-1 rounded-full">
          {conversation.unreadCount}
        </span>
      )}
    </div>
  );
}
