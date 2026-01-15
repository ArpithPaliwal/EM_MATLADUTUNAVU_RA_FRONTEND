import { useState } from "react";
import { sendMessage } from "../../Services/socket";
import { useUploadMessageFile } from "../../hooks/useUploadMessageFile";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { MessagePage, MessageResponseDto } from "../../dto/messages.dto";
import {ImagePlus} from "../../assets/icons/index"
import { useRef } from "react";

type Props = { conversationId: string; senderId: string | undefined };

export default function MessageInput({ conversationId, senderId }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);


const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMessageFile();
  const queryClient = useQueryClient();

  // async function send() {
  //   const hasText = !!text.trim();
  //   const hasFile = !!file;

  //   if (!hasText && !hasFile) return;

  //   let filePath: string | undefined;

  //   // upload file if present
  //   if (hasFile) {
  //     const res = await uploadMutation.mutateAsync(file);
  //     filePath = res?.filePath;
  //   }

  //   // build payload
  //   const payload = {
  //     conversationId,
  //     senderId,
  //     text: text.trim(),
  //     filePath,
  //   };

  //   // send to server — rely on ACK to get the real saved message

  //   sendMessage(
  //     payload,
  //     (savedMsg: MessageResponseDto) => {
  //       // update cache immediately (dedupe guard)

  //     },
  //     (err) => {
  //       console.error("Message send failed:", err);
  //     }
  //   );
  // }

  function rollback(tempId: string) {
    queryClient.setQueryData(
      ["messages", conversationId],
      (old: InfiniteData<MessagePage>) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.filter((m) => m._id !== tempId),
          })),
        };
      }
    );
  }

  async function send() {
    const hasText = !!text.trim();
    const hasFile = !!file;

    if (!hasText && !hasFile) return;

    const tempId = crypto.randomUUID();

    let filePath: string | undefined;

    // 🔹 1. OPTIMISTIC UI UPDATE (IMMEDIATE)
    const optimisticMessage: MessageResponseDto = {
      _id: tempId,
      conversationId,
      senderId: senderId!,
      text: text.trim(),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // queryClient.setQueryData<MessageResponseDto[]>( ["messages", conversationId], (old = []) => [...old, optimisticMessage] );
    queryClient.setQueryData(
      ["messages", conversationId],
      (old: InfiniteData<MessagePage>) => {
        if (!old) return old;

        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              messages: [...old.pages[0].messages, optimisticMessage],
            },
            ...old.pages.slice(1),
          ],
        };
      }
    );

    setText("");
    setFile(null);
    // upload file first (this is fine)
    // if (hasFile) {
    //   const res = await uploadMutation.mutateAsync({
    //     file,
    //     text: text.trim(),
    //   });

    //   filePath = res?.filePath;
    // }
    // sendMessage(
    //   {
    //     conversationId,
    //     senderId,
    //     text: text.trim(),
    //     filePath,
    //     tempId,
    //   },
    //   (savedMsg) => {
    //     // queryClient.setQueryData<MessageResponseDto[]>(
    //     //   ["messages", conversationId],
    //     //   (old = []) =>
    //     //     old.map((msg) =>
    //     //       msg._id === tempId ? savedMsg : msg
    //     //     )
    //     // );
    //     queryClient.setQueryData(
    //       ["messages", conversationId],
    //       (old: InfiniteData<MessagePage>) => {
    //         if (!old) return old;

    //         return {
    //           ...old,
    //           pages: old.pages.map((page) => ({
    //             ...page,
    //             messages: page.messages.map((msg) =>
    //               msg._id === tempId ? savedMsg : msg
    //             ),
    //           })),
    //         };
    //       }
    //     );
    //   },
    //   (err) => {
    //     console.error("Message send failed:", err);

    //     // optional: mark failed or remove temp message
    //     // queryClient.setQueryData<MessageResponseDto[]>(
    //     //   ["messages", conversationId],
    //     //   (old = []) => old.filter((m) => m._id !== tempId)
    //     // );
    //     queryClient.setQueryData(
    //       ["messages", conversationId],
    //       (old: InfiniteData<MessagePage>) => {
    //         if (!old) return old;

    //         return {
    //           ...old,
    //           pages: old.pages.map((page) => ({
    //             ...page,
    //             messages: page.messages.filter((m) => m._id !== tempId),
    //           })),
    //         };
    //       }
    //     );
    //   }
    // );

    try {
      if (hasFile) {
        await uploadMutation.mutateAsync({
          file,
          text: text.trim(),
          conversationId,
        });

        return; // backend will emit socket
      }

      // TEXT ONLY → SOCKET
      sendMessage(
        {
          conversationId,
          senderId,
          text: text.trim(),
          filePath,
          tempId,
        },
        (savedMsg) => {
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: InfiniteData<MessagePage>) => {
              if (!old) return old;

              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  messages: page.messages.map((msg) =>
                    msg._id === tempId ? savedMsg : msg
                  ),
                })),
              };
            }
          );
        },
        () => rollback(tempId)
      );
    } catch (err) {
      console.error("Message send failed:", err);
      rollback(tempId);
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-third rounded-xl w-[88vw] sm:w-full">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        name="userUploadedMediaFile"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="hidden"
      />
      <ImagePlus
      className="text-white cursor-pointer bg-secondary rounded-full p-1"
      size={35}
      onClick={() => fileRef.current?.click()}
    />

      <input
        className="w-full border rounded-xl px-3 py-2 "
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />

      <button
        className="bg-secondary text-white px-4 py-2 rounded-xl"
        onClick={send}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "Uploading…" : "Send"}
      </button>
    </div>
  );
}
