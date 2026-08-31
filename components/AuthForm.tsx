"use client";

import Image from "next/image";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";

type FormType = "signin" | "signup";

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(50, "Full name must be at most 50 characters.")
    .optional(),

  email: z
    .string()
    .email("Please enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

const AuthForm = ({ type }: { type: FormType }) => {

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(" ")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (type === "signup") {
        const response = await axios.post("/api/auth/register", data);
        // Redirect to OTP verification page
        window.location.href = `/verify-otp?email=${data.email}`;
      } else {
        const response = await axios.post("/api/auth/signin", { email: data.email });

        if (response.data.requiresVerification) {
          // Redirect to OTP verification page
          window.location.href = `/verify-otp?email=${response.data.email}`;
        } else {
          // Sign in successful - redirect to dashboard or home
          console.log("Sign in successful:", response.data);
          // TODO: Store user session and redirect to dashboard
          alert("Sign in successful!");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.msg || "Something went wrong");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <div className="w-full max-w-[520px]">

        {/* Title */}
        <h1 className="mb-12 text-center text-[42px] font-bold leading-tight text-[#363A3F]">
          {type === "signin" ? "Sign In" : "Sign Up"}
        </h1>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-7">

            {/* Full Name */}
            {type === "signup" && (
              <Controller
                name="fullName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="rounded-[16px] bg-white px-5 py-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                      <FieldLabel
                        htmlFor="fullName"
                        className="mb-3 text-[16px] font-normal text-[#4A4A4A]"
                      >
                        Full Name
                      </FieldLabel>

                      <Input
                        {...field}
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        aria-invalid={fieldState.invalid}
                        className="h-auto border-0 p-0 text-[16px] shadow-none outline-none placeholder:text-[#C4C4C4] focus-visible:ring-0"
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
            )}

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="rounded-[16px] bg-white px-5 py-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                    <FieldLabel
                      htmlFor="email"
                      className="mb-3 text-[16px] font-normal text-[#4A4A4A]"
                    >
                      Email
                    </FieldLabel>

                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className="h-auto border-0 p-0 text-[16px] shadow-none outline-none placeholder:text-[#C4C4C4] focus-visible:ring-0"
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

            {/* Submit */}
            <Button
              type="submit"
              className="mt-1 h-[80px] w-full rounded-full bg-[#FA7275] text-[16px] font-medium text-white shadow-[0_4px_10px_rgba(250,114,117,0.2)] 
              hover:bg-[#EA6365]"
              disabled={isLoading}
            >
              {type === "signin" ? "Sign In" : "Sign Up"}

              {isLoading && (
                <Image src='/assets/icons/loader.svg' alt="loader" width={24} height={24} className='ml-2 animate-spin '/>
              )}
            </Button>

              {errorMessage && (
                <p className='error-message'>{errorMessage}</p>
              )}

              <div className='body-2 flex justify-center'>
                <p className="text-light-100">
                  {type === "signin" ? "Don't have an account?" : "Already have an account?"}
                </p>

                <Link href={type === "signin" ? "/signup": "/signin"} className='
                ml-1 font-medium text-brand'>
                  {" "}
                  {type === "signin" ? "Sign Up" : "Sign In"}
                </Link>

              </div>

          </FieldGroup>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;