import type { ConversationListResponseDto } from "../../dto/chatListResponse.dto";
import ConversationHeader from "./ConversationHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import {  useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { activeConversation, inActiveConversation } from "../../Services/socket";


type Props = {
  conversation: ConversationListResponseDto | null;
  userId: string | undefined;
  onSelect: (conversation: ConversationListResponseDto | null) => void;
};

export default function ConversationArea({ conversation, userId,onSelect }: Props) {
   const queryClient = useQueryClient();
  useEffect(() => {
  if (!conversation) return;
  if (conversation.unreadCount === 0) return;

  queryClient.setQueryData<ConversationListResponseDto[]>(
    ["conversations"],
    (old) =>
      old?.map((c) =>
        c._id === conversation._id ? { ...c, unreadCount: 0 } : c
      )
  );
}, [conversation,queryClient]);

  useEffect(() => {
  if (!conversation?._id) return;

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      activeConversation(conversation._id);
    } else {
      inActiveConversation(conversation._id);
    }
  };

  // initial state
  handleVisibilityChange();

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    inActiveConversation(conversation._id);
  };
}, [conversation?._id]);

 
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a conversation to start chatting
      </div>
    );
  }


  return (

    <div className="flex flex-col h-full min-h-0  ">
      <ConversationHeader conversation={conversation} onSelect={onSelect}/>

      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
        <MessageList conversationId={conversation._id} />
      </div>

      <div className="border-t">
        <MessageInput conversationId={conversation._id} senderId={userId} />
      </div>
    </div>
  );
}
