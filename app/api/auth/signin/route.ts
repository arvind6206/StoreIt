import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        {
          msg: "Email is required",
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
          msg: "User not found. Please sign up first.",
        },
        { status: 404 }
      );
    }

    // Check if user is verified
    if (user.status !== "verified") {
      return NextResponse.json(
        {
          msg: "Please verify your email first. Check your inbox for the verification code.",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        msg: "Sign in successful",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign in error:", error);

    return NextResponse.json(
      {
        msg: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
