import { useMutation } from "@tanstack/react-query";
import { updateAvatar, updatePassword, updateUsername } from "../API/userApi";



import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice";
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
export const useUpdateUsername = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: AppState) => state.auth.userData);

  return useMutation({
    mutationFn: updateUsername,

    onSuccess: (data) => {
      // assume API returns updated username
      const updatedUsername = data.username;

      dispatch(
        login({
          userData: {
            ...userData,
            username: updatedUsername,
          },
        })
      );
    },
  });
};


export const useUpdateAvatar = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: AppState) => state.auth.userData);

  return useMutation({
    mutationFn: updateAvatar,

    onSuccess: (data) => {
      const updatedAvatar = data.avatar; 

      dispatch(
        login({
          userData: {
            ...userData,
            avatar: updatedAvatar,
          },
        })
      );
    },
  });
};
export const useUpdatePassword = () =>
  useMutation({
    mutationFn: updatePassword,
  });
