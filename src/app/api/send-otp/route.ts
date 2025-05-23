import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/helpers/sendOtp";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    const result = await sendOtpEmail(email);
    console.log("result", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
