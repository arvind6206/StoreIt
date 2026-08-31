import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOTP, generateOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email } = await req.json();

    // Validate input
    if (!fullName || !email) {
      return NextResponse.json(
        {
          msg: "fullName and email are required",
        },
        { status: 400 }
      );
    }

    // Check whether user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (existingUser.status === "verified") {
        return NextResponse.json(
          {
            msg: "User already exists",
          },
          { status: 409 }
        );
      }
      // If user exists but not verified, resend OTP
      const otp = generateOTP(6);
      const otpExpiry = generateOTPExpiry(10);

      await prisma.user.update({
        where: { email },
        data: { otp, otpExpiry },
      });

      try {
        await sendOTPEmail({
          email,
          otp,
          fullName: existingUser.fullName,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }

      return NextResponse.json(
        {
          msg: "OTP sent to your email. Please verify to complete registration.",
          email,
        },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP(6);
    const otpExpiry = generateOTPExpiry(10);

    // Create pending user with OTP
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        otp,
        otpExpiry,
        status: "pending",
      },
    });

    // Send OTP email
    try {
      await sendOTPEmail({
        email,
        otp,
        fullName,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    return NextResponse.json(
      {
        msg: "OTP sent to your email. Please verify to complete registration.",
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        msg: "Something went wrong",
      },
      { status: 500 }
    );
  }
}