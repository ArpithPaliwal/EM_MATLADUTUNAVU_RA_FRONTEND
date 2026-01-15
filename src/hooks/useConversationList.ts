import { useQuery } from "@tanstack/react-query";
import { getConversationsList } from "../API/chatApi.js";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversationsList,
    staleTime: 60_000,          // 1 minute
    refetchOnWindowFocus: false,
  });
}
