import { useState } from "react";
import type { ConversationListResponseDto } from "../../dto/chatListResponse.dto";
import { getConversationDisplay } from "../../utils/conversationDisplay";
import { updateGroupName, updateGroupAvatar } from "../../API/chatApi";
import { useSelector } from "react-redux";
import {ArrowLeft} from "../../assets/icons/index"
type Props = {
  conversation: ConversationListResponseDto;
  onSelect: (conversation: ConversationListResponseDto | null) => void;
};

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
export default function ConversationHeader({ conversation,onSelect }: Props) {
  const userData = useSelector((state: AppState) => state.auth.userData);
  const { name, avatar } = getConversationDisplay(conversation);
  const type = conversation.type;
  const _id = conversation._id;
  const createdBy = conversation.createdBy;
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(name);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (username !== name) {
        await updateGroupName({  name: username ,createdBy},_id);
      }

      if (file) {
        await updateGroupAvatar({  file,createdBy },_id);
      }

      setOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
    
      <div className="flex items-center w-full">
        <div className="sm:hidden bg-third rounded-full p-2"onClick={()=>onSelect(null)}> <ArrowLeft className="text-primary" size={24}/> </div>
      <div
        onClick={() => type === "group" && setOpen(true)}
        className="flex items-center gap-3 h-16 px-4 rounded-xl bg-third w-full  sm:w-full cursor-pointer"
      >
        
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-semibold text-gray-900">{name}</span>
      </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 sm:w-90 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4">
              <img
                src={file ? URL.createObjectURL(file) : avatar}
                className="w-16 h-16 rounded-full object-cover"
              />
              <h2>{name}</h2>
              {createdBy == userData?._id && (
                <div className="flex flex-col gap-2 w-40 sm:w-fit">
                  <label htmlFor="avatar">avatar</label>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="border p-2 rounded"
                  />
                  <label htmlFor="groupname">Groupname</label>
                  <input
                    value={username}
                    id="groupname"
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border p-2 rounded-md"
                    placeholder="Group name"
                  />

                  <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full bg-black text-white py-2 rounded-md"
                  >
                    {loading ? "Updating..." : "Update Group"}
                  </button>
                </div>
              )}
              <button className="bg-red-500 py-3 px-6 text-medium text-white rounded-2xl">Leave Group</button>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}
