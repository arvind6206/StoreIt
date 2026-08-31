import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        {
          msg: "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          msg: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.status === "verified") {
      return NextResponse.json(
        {
          msg: "User already verified",
        },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return NextResponse.json(
        {
          msg: "OTP has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otp !== otp) {
      return NextResponse.json(
        {
          msg: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // Update user status to verified
    const verifiedUser = await prisma.user.update({
      where: { email },
      data: {
        status: "verified",
        otp: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json(
      {
        msg: "User created successfully",
        user: {
          id: verifiedUser.id,
          fullName: verifiedUser.fullName,
          email: verifiedUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);

    return NextResponse.json(
      {
        msg: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
