import { useForm } from "react-hook-form";
import { X } from "../../../assets/icons/index";
import { useConversations } from "../../../hooks/useConversationList";
import { useCreateGroupConversation } from "../../../hooks/useCreateGroupConversation";



type Props = {
  onClose: () => void;
};

type FormData = {
  name: string;
  image: FileList;
  members: string[]; // This will now correctly be an array of IDs
};

export default function GroupCreateModal({ onClose }: Props) {
  const { data: conversations } = useConversations();
  const { mutate, isPending } = useCreateGroupConversation();

  // FIX HERE: Added defaultValues to initialize members as an empty array
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      name: "",
      members: [], 
    }
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      image: data.image?.[0], // Safe access if no image selected
      members: data.members,  // This is now ["id1", "id2"]
    };

    mutate(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: (error) => {
        console.error("Group creation failed:", error);
        // Optional: Keep modal open on error so user can retry?
        // onClose(); 
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white md:w-[35vw] w-[70vw] rounded-xl p-4 relative h-100">
        
        <button onClick={onClose} className="absolute right-3 top-3">
          <X />
        </button>

        <h2 className="text-2xl font-semibold mb-3 text-center">Create Group</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <input
            {...register("name", { required: true })}
            placeholder="Group Name"
            className="w-full border p-2 rounded"
          />

          <input 
            type="file" 
            accept="image/*" 
            {...register("image")} 
            className="p-3 w-full border rounded" 
          />

          <div className="border rounded p-2 max-h-40 overflow-y-auto">
            <p className="text-sm font-medium mb-1">Select Members</p>
            
            {conversations
  ?.filter((c) => c?.type === "direct")
  .map((c) => {
    const user = c?.partner;

    if (!user?._id) return null;

    return (
      <label
        key={user._id}
        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
      >
        <input
          type="checkbox"
          value={user._id}
          {...register("members")}
        />

        <img
          src={user.avatar}
          alt={user.username}
          className="w-6 h-6 rounded-full object-cover"
        />

        <span>{user.username}</span>
      </label>
    );
  })}

          </div>

          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-secondary text-white rounded p-2 disabled:opacity-50 hover:bg-secondary/90 transition"
          >
            {isPending ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}