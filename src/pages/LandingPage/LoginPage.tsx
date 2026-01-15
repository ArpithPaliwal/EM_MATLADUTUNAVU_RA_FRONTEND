import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "../../utils/Toast";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import type { RegisterResponseDto } from "../../dto/auth.dto";
import { loginUser } from "../../API/userApi";
import { useNavigate } from "react-router";
import type { ApiError } from "../../dto/apiError";
import nameDarkTheme from "../../assets/name_dark-theme.svg";
import nameLightTheme from "../../assets/name_light-theme.svg";
import { socket } from "../../Services/socket";
const signupSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters long"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{4,}$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
});
interface ToastState {
  type: "success" | "error";
  message: string;
}

function LoginPage() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data: RegisterResponseDto) => {
      dispatch(login({ userData: data })); //remember to chage it
      setToast({ type: "success", message: "User Login successfully!" });
      socket.disconnect();
      socket.connect();

      navigate("/Home");
    },
    onError: (error: unknown) => {
      const err = error as ApiError;

      setToast({
        type: "error",
        message: err.message ?? "Login failed",
      });
    },
  });
  const onSubmit = (data: z.infer<typeof signupSchema>) => {
    console.log("validated data:", data);

    mutation.mutate(data);
  };
  const isDark = document.documentElement.dataset.theme === "dark";
  return (
    <div className="relative flex justify-center items-center bg-primary overflow-hidden p-4 min-h-screen">
      <div className="w-full max-w-md bg-accent border border-[#0096c7]/30 p-7 rounded-2xl shadow-lg flex justify-center items-center flex-col">
        <div className="md:h-[20vh] md:w-[20vw]">
          <img
            src={isDark ? nameDarkTheme : nameLightTheme}
            className="  h-full w-full object-contain"
          />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-[#0175FE]"
              {...register("username")}
            />
            <p className="text-red-500 text-sm mt-1">
              {errors.username?.message}
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-[#0175FE]"
              {...register("password")}
            />
            <p className="text-red-500 text-sm mt-1">
              {errors.password?.message}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0096c7] hover:bg-[#0163D2] text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting…" : " Back To My Throne "}
          </button>
        </form>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default LoginPage;
