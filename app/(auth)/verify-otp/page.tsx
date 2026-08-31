"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OtpValues = z.infer<typeof otpSchema>;

export default function VerifyOTPPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: OtpValues) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        email,
        otp: data.otp,
      });

      // Redirect to login page on success
      router.push("/signin?verified=true");
    } catch (error) {
      console.error("OTP verification error:", error);
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.msg || "Something went wrong");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOTP() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/api/auth/register", {
        fullName: "User", // This will be ignored for existing users
        email: email || "",
      });

      setCountdown(600); // Reset countdown
      alert("OTP sent successfully!");
    } catch (error) {
      console.error("Resend OTP error:", error);
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.msg || "Something went wrong");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <div className="w-full max-w-[520px]">
        {/* Title */}
        <h1 className="mb-4 text-center text-[42px] font-bold leading-tight text-[#363A3F]">
          Verify Your Email
        </h1>
        <p className="mb-8 text-center text-[16px] text-[#4A4A4A]">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-7">
            {/* OTP Input */}
            <Controller
              name="otp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="rounded-[16px] bg-white px-5 py-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                    <FieldLabel
                      htmlFor="otp"
                      className="mb-3 text-[16px] font-normal text-[#4A4A4A]"
                    >
                      Enter OTP
                    </FieldLabel>

                    <input
                      {...field}
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="h-auto w-full border-0 p-0 text-[24px] font-bold tracking-widest shadow-none outline-none placeholder:text-[#C4C4C4] focus:ring-0 text-center"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="mt-2"
                      />
                    )}
                  </div>
                </Field>
              )}
            />

            {/* Countdown */}
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#4A4A4A]">
                Code expires in <span className="font-medium">{formatTime(countdown)}</span>
              </p>
              {countdown === 0 && (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-[14px] font-medium text-[#FA7275] hover:text-[#EA6365] disabled:opacity-50"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="mt-1 h-[80px] w-full rounded-full bg-[#FA7275] text-[16px] font-medium text-white shadow-[0_4px_10px_rgba(250,114,117,0.2)] 
              hover:bg-[#EA6365]"
              disabled={isLoading}
            >
              Verify Email

              {isLoading && (
                <Image src='/assets/icons/loader.svg' alt="loader" width={24} height={24} className='ml-2 animate-spin '/>
              )}
            </Button>

            {errorMessage && (
              <p className='error-message'>{errorMessage}</p>
            )}

            <div className='body-2 flex justify-center'>
              <p className="text-[#4A4A4A]">
                Wrong email?
              </p>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className='ml-1 font-medium text-[#FA7275] hover:text-[#EA6365]'
              >
                {" "}
                Change email
              </button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
