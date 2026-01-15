import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNewGroupConversation } from "../API/chatApi";

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewGroupConversation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};
