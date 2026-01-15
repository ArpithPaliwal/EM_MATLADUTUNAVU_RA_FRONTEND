import ThemeToggle from "../../utils/ThemeToggle";
import { useSelector } from "react-redux";
import instagramIcon from "../../assets/instagram.png";
import linkedinIcon from "../../assets/linkedin.png";
import resumeIcon from "../../assets/online-resume.png";
import communicationIcon from "../../assets/communication.png";
import Arpith from "../../assets/Arpith.jpg";
import { useState } from "react";
import {
  useUpdateAvatar,
  useUpdateUsername,
  useUpdatePassword,
} from "../../hooks/useUpdateUsernameAvatar";

function DashBoard() {
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

  const { userData } = useSelector((state: AppState) => state.auth);

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateUsernameMutation = useUpdateUsername();
  const updateAvatarMutation = useUpdateAvatar();
  const updatePasswordMutation = useUpdatePassword();

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{4,}$/;

  const handleSubmit = async () => {
    try {
      if (!username && !avatar && !oldPassword && !newPassword) return;

      if (username) {
        await updateUsernameMutation.mutateAsync(username);
      }

      if (avatar) {
        await updateAvatarMutation.mutateAsync(avatar);
      }

      if (oldPassword || newPassword) {
        if (!oldPassword || !newPassword) {
          alert("Both old and new passwords are required");
          return;
        }

        if (!passwordRegex.test(newPassword)) {
          alert("Password does not meet security requirements");
          return;
        }

        await updatePasswordMutation.mutateAsync({
          oldPassword,
          newPassword,
        });
      }

      alert("Profile updated successfully");

      setOldPassword("");
      setNewPassword("");
      setUsername("");
      setAvatar(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-primary h-full w-full relative">
      <div className="absolute right-2 top-2">
        <ThemeToggle />
      </div>

      <div className="flex flex-col-reverse items-center justify-between h-full sm:h-screen px-20 sm:flex-row gap-5 sm:gap-0 pt-10 sm:pt-0">

        {/* LEFT PROFILE CARD */}
        <div className="p-4 mt-4 w-80 bg-secondary rounded-2xl">
          <div className="bg-[#f8f9fa] rounded-xl shadow-md p-4 flex flex-col items-center text-center">
            <img
              src={Arpith}
              className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-[#0175FE]"
            />
            <h2 className="text-xl font-semibold text-gray-800">
              Arpith Paliwal
            </h2>
            <div className="w-10 border-b border-gray-300 my-2"></div>

            <div className="flex flex-col gap-2 w-full">
              <a className="flex items-center gap-3 bg-white p-2 rounded-lg shadow">
                <img src={instagramIcon} className="w-5 h-5" /> Instagram
              </a>
              <a className="flex items-center gap-3 bg-white p-2 rounded-lg shadow">
                <img src={linkedinIcon} className="w-5 h-5" /> LinkedIn
              </a>
              <a className="flex items-center gap-3 bg-white p-2 rounded-lg shadow">
                <img src={resumeIcon} className="w-5 h-5" /> Portfolio
              </a>
              <a className="flex items-center gap-3 bg-white p-2 rounded-lg shadow">
                <img src={communicationIcon} className="w-5 h-5" /> Email
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT SETTINGS */}
        <div className="flex flex-col items-center">

          <div className="h-50 w-50 overflow-hidden rounded-full border border-blue-500 shadow-sm">
            <img
              className="h-full w-full object-cover"
              src={userData?.avatar}
            />
          </div>

          <div className="w-80 sm:w-120  bg-primary text-primary border-2 border-primary rounded-xl p-4 mt-4 flex flex-col gap-3">

            <input
              type="text"
              placeholder="Update username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 rounded border border-secondary"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              className="p-2 rounded border border-secondary"
            />

            <input
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="p-2 rounded border border-secondary"
            />

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2 rounded border border-secondary"
            />

            {updateUsernameMutation.isError && (
              <p className="text-red-500 text-sm">
                {updateUsernameMutation.error.message}
              </p>
            )}

            {updateAvatarMutation.isError && (
              <p className="text-red-500 text-sm">
                {updateAvatarMutation.error.message}
              </p>
            )}

            {updatePasswordMutation.isError && (
              <p className="text-red-500 text-sm">
                {updatePasswordMutation.error.message}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              updateUsernameMutation.isPending ||
              updateAvatarMutation.isPending ||
              updatePasswordMutation.isPending
            }
            className="w-40 bg-secondary rounded-2xl text-white py-2 mt-4"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
