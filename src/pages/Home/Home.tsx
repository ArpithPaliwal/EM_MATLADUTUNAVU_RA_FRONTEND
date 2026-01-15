import ChatList from "../../components/chat/ChatList";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ConversationListHeader from "../../components/chat/ConversationListHeader";
import type { ConversationListResponseDto } from "../../dto/chatListResponse.dto";
import ConversationArea from "../../components/chat/conversationArea";
import { useQueryClient } from "@tanstack/react-query";
import { onUnreadUpdate } from "../../Services/socket";
import nameDarkTheme from "../../assets/name_dark-theme.svg";
import nameLightTheme from "../../assets/name_light-theme.svg";
import ThemeToggle from "../../utils/ThemeToggle";
import type { RootState } from "../../store/store";
import sound1 from "../../assets/sounds/sound1.mp3"
import sound2 from "../../assets/sounds/sound2.mp3"
import sound3 from "../../assets/sounds/sound3.mp3"

import { Link } from "react-router-dom";
type UserData = {
  avatar: string;
  _id: string;
};

type AuthState = {
  userData: UserData | null;
  isLoggedIn: boolean;
};

type AppState = {
  auth: AuthState;
};

function Home() {
  const sounds = [
    sound1,
    sound2,
    sound3,
  ];
   const playRandomSound = () => {
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const audio = new Audio(sounds[randomIndex]);
    audio.currentTime = 0;
    audio.play();
  };
  const [selectedChat, setSelectedChat] = useState<ConversationListResponseDto | null>(null);
  const isDark = useSelector((state: RootState) => state.theme);
  const { userData } = useSelector((state: AppState) => state.auth);
  const queryClient = useQueryClient();

  useEffect(() => {
    const cleanup = onUnreadUpdate(({ conversationId, incrementBy, text }) => {
      
      if (selectedChat?._id === conversationId) {
        return;
      }

      queryClient.setQueryData(
        ["conversations"],
        (oldData: ConversationListResponseDto[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((conv) =>
            conv._id === conversationId
              ? {
                  ...conv,
                  unreadCount: conv.unreadCount + incrementBy,
                  lastMessageText: text,
                }
              : conv
          );
        }
      );
    });

    return cleanup;
  }, [queryClient, selectedChat?._id]);

  return (
    <div className="px-3 h-screen overflow-hidden bg-primary w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="h-10 w-32 md:h-12 md:w-40" onClick={playRandomSound}>
          <img
            src={isDark === "dark" ? nameDarkTheme : nameLightTheme}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex gap-5 items-center">
          <ThemeToggle />
          <Link to={"/DashBoard"}>
          <div className="h-10 w-10 md:h-11 md:w-11 overflow-hidden rounded-full border border-blue-500 shadow-sm">
            <img
              className="h-full w-full object-cover"
              src={userData?.avatar}
              alt="Profile"
            />
          </div>
          </Link>
        </div>
      </div>

      <div className="border-3 border-blue-300 rounded-2xl p-2 flex gap-2 h-[85vh] w-full">
        <div
          className={`flex flex-col pr-1 w-full sm:w-80 sm:min-w-80 sm:border-r border-blue-300 ${
            selectedChat ? "hidden" : "block"
          } sm:block`}
        >
          <ConversationListHeader />

          <div className="h-full  border-gray-300 dark:border-gray-600 overflow-y-auto pr-2">
            <ChatList selectedChat={selectedChat} onSelect={setSelectedChat} />
          </div>
        </div>

        <div
          className={`flex-1 min-h-0 ${
            selectedChat ? "block" : "hidden"
          } sm:block`}
        >
          <ConversationArea
            conversation={selectedChat}
            onSelect={setSelectedChat}
            userId={userData?._id}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
