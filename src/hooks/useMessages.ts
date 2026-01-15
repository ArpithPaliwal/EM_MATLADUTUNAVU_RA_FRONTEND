import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getMessages } from "../API/messagesApi";
import type { MessagePage } from "../dto/messages.dto";
export function useMessages(conversationId: string) {
    return useInfiniteQuery<MessagePage,Error,InfiniteData<MessagePage> ,readonly unknown[],string|null>({
        queryKey: ['messages', conversationId],
        initialPageParam: null,
        queryFn: ({pageParam}) => getMessages(conversationId,pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 60_000,          
        refetchOnWindowFocus: true,
        
    })
}