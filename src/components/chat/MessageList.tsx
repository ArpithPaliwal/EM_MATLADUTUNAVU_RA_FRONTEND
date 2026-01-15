import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { useMessages } from "../../hooks/useMessages";
import { useSelector } from "react-redux";
import {
  onMessageNew,
  onMessageDeleted,
  activeConversation,
  inActiveConversation,
  socket,
  deleteMessage,
} from "../../Services/socket";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { MessagePage, MessageResponseDto } from "../../dto/messages.dto";

type Props = {
  conversationId: string;
};

type UserData = {
  _id: string;
};

type AuthState = {
  userData: UserData | null;
  isLoggedIn: boolean;
};

type AppState = {
  auth: AuthState;
};

const isMongoObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export default function MessageList({ conversationId }: Props) {
  // 1. Refs
  const topRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const latestReadIdRef = useRef<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string;
  } | null>(null);

  // 2. Data
  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useMessages(conversationId);
  const { userData } = useSelector((state: AppState) => state.auth);
  const queryClient = useQueryClient();

  // 3. Flatten Messages
  const allMessages = Array.from(
    new Map(
      data?.pages.flatMap((p: MessagePage) => p.messages).map((m) => [m._id, m])
    ).values()
  ).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const handleContextMenu = (
    e: React.MouseEvent,
    msgId: string,
    isMine: boolean
  ) => {
    e.preventDefault();
    if (!isMine) return;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: msgId,
    });
  };

  const handleDeleteClick = () => {
    if (!contextMenu || !userData) return;

    deleteMessage({
      messageId: contextMenu.messageId,
      senderId: userData._id,
    });

    setContextMenu(null);
    queryClient.setQueryData<InfiniteData<MessagePage>>(
      ["messages", conversationId],
      (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            messages: p.messages.filter(
              (m) => m._id.toString() !== contextMenu.messageId.toString()
            ),
          })),
        };
      }
    );
  };
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (conversationId) {
      // clear cache and start fresh (good for fixing scroll glitches on load)
      queryClient.resetQueries({ queryKey: ["messages", conversationId] });
    }
  }, [conversationId, queryClient]);
  /* --------------------------------------------------
     ⚡ SCROLL RESTORATION (The Fix)
  -------------------------------------------------- */
  useLayoutEffect(() => {
    const container = containerRef.current;

    // Only run if we have a "previous height" captured (meaning we just fetched history)
    if (container && previousScrollHeightRef.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const heightDifference =
        newScrollHeight - previousScrollHeightRef.current;

      // Only adjust if content actually grew
      if (heightDifference > 0) {
        container.scrollTop = heightDifference;
      }

      // Reset immediately so normal scrolling isn't affected
      previousScrollHeightRef.current = 0;
    }
  }, [allMessages]); // 👈 Run this when the message ARRAY changes, not just 'data'

  /* --------------------------------------------------
     ⚡ OBSERVER (Trigger Fetch)
  -------------------------------------------------- */
  useEffect(() => {
    if (!topRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          // 📸 CAPTURE HEIGHT BEFORE FETCH
          if (containerRef.current) {
            previousScrollHeightRef.current = containerRef.current.scrollHeight;
          }

          fetchNextPage();
        }
      },
      { threshold: 0.5 } // Trigger when item is 50% visible (less aggressive than 1)
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  /* --------------------------------------------------
     SOCKETS & SYNC (Existing Logic)
  -------------------------------------------------- */
  useEffect(() => {
    if (!conversationId) return;
    activeConversation(conversationId);

    // const offNew = onMessageNew((msg) => {
    //   if (msg.senderId === userData?._id) return;

    //   // queryClient.setQueryData<MessageResponseDto[]>(
    //   //   ["messages", conversationId],
    //   //   (old = []) => {
    //   //     if (old.some((m) => m._id === msg._id)) return old;
    //   //     return [...old, msg];
    //   //   }
    //   // );

    //   if (isMongoObjectId(msg._id)) latestReadIdRef.current = msg._id;

    // });

    const offNew = onMessageNew((msg: MessageResponseDto) => {
      if (msg.senderId === userData?._id) return;

      queryClient.setQueryData<InfiniteData<MessagePage>>(
        ["messages", conversationId],
        (old) => {
          if (!old) return old;

          const lastPage = old.pages[old.pages.length - 1];

          // prevent duplicates
          if (lastPage.messages.some((m) => m._id === msg._id)) return old;

          return {
            ...old,
            pages: old.pages.map((p, idx) =>
              idx === old.pages.length - 1
                ? { ...p, messages: [...p.messages, msg] }
                : p
            ),
          };
        }
      );

      if (isMongoObjectId(msg._id)) latestReadIdRef.current = msg._id;
    });

    const offDeleted = onMessageDeleted(({ messageId }) => {
      console.log("received messageId:", messageId);

      queryClient.setQueryData<InfiniteData<MessagePage>>(
        ["messages", conversationId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              messages: p.messages.filter(
                (m) => m._id.toString() !== messageId.toString()
              ),
            })),
          };
        }
      );
    });

    return () => {
      inActiveConversation(conversationId);
      offNew();
      offDeleted();
    };
  }, [conversationId, queryClient, userData]);

  useEffect(() => {
    if (!data || data?.pages?.length === 0) return;
    const lastPersisted = allMessages
      ?.filter((m) => isMongoObjectId(m._id))
      ?.at(-1);
    if (!lastPersisted) return;
    latestReadIdRef.current = lastPersisted._id;
    socket.emit("conversation:read", {
      conversationId,
      lastReadMessageId: lastPersisted._id,
    });
  }, [conversationId, data, allMessages]);

  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => {
      const id = latestReadIdRef.current;
      if (!id || !isMongoObjectId(id)) return;
      socket.emit("conversation:read", {
        conversationId,
        lastReadMessageId: id,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  if (isLoading) return <div className="p-4 text-sm">Loading messages…</div>;
  if (isError)
    return (
      <div className="p-4 text-sm text-red-500">Failed to load messages.</div>
    );

  return (
    <div
      ref={containerRef}
      style={{ overflowAnchor: "none" }}
      className="flex flex-col gap-2 p-3 overflow-y-auto relative h-full"
    >
      <div ref={topRef} className="h-4 shrink-0 w-full" />
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-white border shadow-md rounded-md text-sm"
        >
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 hover:bg-red-100 text-red-600 w-full text-left"
          >
            Delete
          </button>
        </div>
      )}

      {allMessages.map((msg) => {
        const isMine = msg.senderId === userData?._id;
        return (
          <div
            key={msg._id}
            onContextMenu={(e) => handleContextMenu(e, msg._id, isMine)}
            className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
              isMine
                ? "self-end bg-secondary text-white"
                : "self-start bg-gray-200 text-gray-900"
            }`}
          >
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="attachment"
                className="mt-1 rounded-md max-h-60 object-cover "
              />
            )}
            {msg.videoUrl && (
              <video
                src={msg.videoUrl}
                controls
                className="mt-1 rounded-md max-h-60"
              />
            )}
            {msg.text && <p className="justify-end flex">{msg.text}</p>}
            <div className="mt-1 text-xs opacity-70 text-right">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
