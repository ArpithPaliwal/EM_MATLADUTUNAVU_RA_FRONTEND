import { useMutation } from "@tanstack/react-query";
import { uploadMedia } from "../API/messagesApi";

export function useUploadMessageFile() {
  return useMutation({
    mutationFn: uploadMedia,
  });
}


