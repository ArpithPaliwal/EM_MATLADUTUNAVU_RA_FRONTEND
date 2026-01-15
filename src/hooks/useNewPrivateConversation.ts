import { useMutation } from "@tanstack/react-query";
import { createNewPrivateConversation } from "../API/chatApi";
import type { ConversationListResponseDto } from "../dto/chatListResponse.dto";
import type { ApiError } from "../dto/apiError";


// export function useCreatePrivateConversation() {
//   return useMutation<
//     ConversationListResponseDto[],
//     ApiError,
//     { memberId: string }
//   >({
//     mutationFn: createNewPrivateConversation,
//   });
// }
export function useCreatePrivateConversation() {
  return useMutation<
    ConversationListResponseDto[],
    ApiError,
    { memberUsername: string }
  >({
    mutationFn: createNewPrivateConversation,

    onSuccess: (data) => {
      console.log("Private conversation created successfully");
      
      console.log("Response:", data);
    },

    onError: (error) => {
      console.error("Failed to create private conversation");
      console.error("Error message:", error.message);
      
    },
  });
}
