import { verifyOtp } from "@/helpers/sendOtp";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  if (!email || !otp) {
    return NextResponse.json(
      { success: false, error: "Email and OTP are required" },
      { status: 400 }
    );
  }

  try {
    const result = await verifyOtp(email, otp);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
