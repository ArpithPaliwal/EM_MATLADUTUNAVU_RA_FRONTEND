import { UserPlus, CirclePlus } from "../../assets/icons/index";
import { useEffect, useState } from "react";
import { useCreatePrivateConversation } from "../../hooks/useNewPrivateConversation";
import GroupCreateModal from "./modal/groupCreateModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useGetUserNames } from "../../hooks/useGetUserNames";

export default function ConversationListHeader() {
  const [value, setValue] = useState<string>("");
  const [openGroupForm, setOpenGroupForm] = useState(false);
  const debouncedValue = useDebounce(value, 500);

  const {
    mutate: createPrivate,
    isPending: isPrivatePending,
    error: CreateError,
    reset,
  } = useCreatePrivateConversation();

  useEffect(() => {
    if (!CreateError) return;

    const timer = setTimeout(() => {
      reset(); // clears error inside react-query
    }, 2000);

    return () => clearTimeout(timer);
  }, [CreateError, reset]);

  // const {
  //   mutate: createGroup,
  //   isPending: isGroupPending,
  // } = useCreateGroupConversation();

  const { data, isLoading, isError } = useGetUserNames(debouncedValue);
  const handlePrivateCreate = () => {
    if (!value.trim()) return;
    createPrivate({ memberUsername: value });
  };

  // const handleGroupCreate = () => {
  //   if (!value.trim()) return;
  //   createGroup({ memberId: value });
  // };

  return (
    <div className="font-semibold text-lg mb-3 flex gap-1 w-full relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border-2 border-blue-200 rounded-xl px-2 text-primary w-full"
        placeholder="Enter username"
      />

      {isLoading && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 px-3 py-2 text-sm text-gray-500">
          Searching...
        </div>
      )}

      {isError && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 px-3 py-2 text-sm text-red-500">
          Failed to load users
        </div>
      )}
      {CreateError && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 px-3 py-2 text-sm text-red-500">
          {CreateError.message}
        </div>
      )}

      {data && data.length > 0 && !isLoading && !isError && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
          {data.map((user: string) => (
            <div
              key={user}
              className="px-3 py-2 hover:bg-[#0096c7] cursor-pointer "
              onClick={() => setValue(user)}
            >
              {user}
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          className="bg-secondary rounded-full p-1 disabled:opacity-50"
          onClick={handlePrivateCreate}
          disabled={isPrivatePending}
        >
          <UserPlus color="white" />
        </button>
      </div>

      <div>
        <button
          className="bg-secondary rounded-full p-1"
          onClick={() => setOpenGroupForm(true)}
        >
          <CirclePlus color="white" />
        </button>
      </div>

      {openGroupForm && (
        <GroupCreateModal onClose={() => setOpenGroupForm(false)} />
      )}
    </div>
  );
}
