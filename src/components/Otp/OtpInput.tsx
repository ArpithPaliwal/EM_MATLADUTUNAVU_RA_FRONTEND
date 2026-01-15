import { useRef, useState, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export default function OtpInput({ length , onComplete }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    const input = inputRefs.current[index];
    if (input) input.focus();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (!/^\d$/.test(value)) return;
    const newOtp = [...otp];

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && length && index < length - 1) {
      focusInput(index + 1);
    }

    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        focusInput(index - 1);
      }
    }
  };
  useEffect(() => {
    focusInput(0);
  }, []);
  return (
    <div className="flex gap-3 my-8">
      {otp.map((value, index) => (
        <input
          key={index}
          value={value}
          maxLength={1}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="h-10 w-10 border-2 border-primary bg-white text-center rounded"
        />
      ))}
    </div>
  );
}
