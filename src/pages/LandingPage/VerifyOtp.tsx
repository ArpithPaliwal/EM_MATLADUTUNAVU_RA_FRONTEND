import { useState } from "react";
import OtpInput from "../../components/Otp/OtpInput";
import { useMutation } from "@tanstack/react-query";
import Toast from "../../utils/Toast";
import { useNavigate } from "react-router-dom";
import type { ApiError } from "../../dto/apiError";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { submitOtp } from "../../API/userApi";
import { useLocation } from "react-router-dom";

interface ToastState {
  type: "success" | "error";
  message: string;
}
function VerifyOtp() {
  const [otpValue, setOtpValue] = useState<string>("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { state } = location;
  const { email } = state || {};
  const handleOtpComplete = (otp: string) => {
    console.log("submitted:", otp);
    setOtpValue(otp);
  };

  const mutation = useMutation({
    mutationFn: submitOtp,          
    onSuccess: (data) => {
      setToast({ type: "success", message: "OTP verified successfully!" });
      dispatch(login({ userData: data }));
      navigate("/login");
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      setToast({
        type: "error",
        message: err.message ?? "OTP verification failed",
      });
    },
  });

  function handleSubmit() {
    if (otpValue.length === 6) {
      mutation.mutate({ email, otpValue });
    }
  }
  const isDark = document.documentElement.dataset.theme === "dark";
  return (
    <div className="relative flex justify-center items-center bg-background overflow-hidden p-4 min-h-screen">
      <div className="w-full max-w-md bg-accent border border-[#0096c7]/30 p-7 rounded-2xl shadow-lg flex justify-center items-center flex-col">

        <div className="md:h-[20vh] md:w-[20vw]">
          
          <img  src={isDark ? "name_dark-theme.svg" : "name_light-theme.svg"} className="hidden h-full w-full object-contain" />
        </div>

        <OtpInput length={6} onComplete={handleOtpComplete} />

        <button
          onClick={handleSubmit}
          disabled={mutation.isPending || otpValue.length !== 6}
          className="mt-6 w-full py-3 rounded-xl font-semibold bg-secondary text-white disabled:opacity-60"
        >
          {mutation.isPending ? "Arming..." : "Lock In Code"}
        </button>
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

export default VerifyOtp;

interface ToastState {
  type: "success" | "error";
  message: string;
}
