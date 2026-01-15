import { useForm } from "react-hook-form";
import {  z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import nameDarkTheme from "../../assets/name_dark-theme.svg"
import nameLightTheme from "../../assets/name_light-theme.svg"
import Toast from "../../utils/Toast";

import { initiateRegisterUser } from "../../API/userApi";
import { createFormData } from "../../utils/createFormData";
import { useNavigate } from "react-router";
import type { ApiError } from "../../dto/apiError";

const signupSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{4,}$/
,
      "Password must contain at least one letter and one number"
    ),
  avatar: z
    .any()
    .refine((files) => files?.length === 1, "Avatar image is required")
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Only JPEG, PNG, or WEBP images are allowed"
    )
    .refine(
      (files) => files?.[0]?.size <= 2 * 1024 * 1024,
      "File must be smaller than 2MB"
    ),
});
interface ToastState {
  type: "success" | "error";
  message: string;
}

function SignupPage() {
  const [toast, setToast] = useState<ToastState | null>(null);
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const mutation = useMutation({
    mutationFn: initiateRegisterUser,
    onSuccess: () => {
      const email = getValues("email");
      // dispatch(login({ userData: data })); //remember to chage it
      setToast({ type: "success", message: "OTP sent successfully!" });
      navigate("/VerifyOtp",{state:{email}});
    },
    onError: (error: unknown) => {
      const err = error as ApiError;

      setToast({
        type: "error",
        message: err.message ?? "Signup failed",
      });
    },
  });
  const onSubmit = (data: z.infer<typeof signupSchema>) => {
    console.log("validated data:", data);
    const formData = createFormData(data);
    mutation.mutateAsync(formData);
  };
  const isDark = document.documentElement.dataset.theme === "dark";
  return (
    <div className="relative flex justify-center items-center bg-primary overflow-hidden p-4 min-h-screen">
      <div className="w-full max-w-md bg-accent border border-[#0096c7]/30 p-7 rounded-2xl shadow-lg flex justify-center items-center flex-col">
        <div className="md:h-[20vh] md:w-[20vw]">
          
          <img
            src={isDark ? nameDarkTheme : nameLightTheme}
            className=" h-full w-full object-contain"
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

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-[#0175FE]"
              {...register("email")}
            />
            <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
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

          {/* Avatar */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1">
              Avatar Image
            </label>
            <input
              type="file"
              accept=".jpeg,.png,.webp"
              className="w-full text-sm border  rounded-lg p-2 text-primary focus:outline-none focus:ring-2 focus:ring-[#0175FE]"
              {...register("avatar")}
            />
            <p className="text-red-500 text-sm mt-1">
              {errors.avatar?.message as string}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0096c7] hover:bg-[#0163D2] text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting…" : "Create My Kingdom "}
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

export default SignupPage;
