import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import Invite from "@/models/Invite";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json();
  if (!token || !name || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();

  const invite = await Invite.findOne({ token });
  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.status === "accepted") {
    return NextResponse.json({ error: "This invite has already been accepted" }, { status: 410 });
  }

  const existing = await User.findOne({ email: invite.email });
  if (existing) {
    return NextResponse.json({ error: "An account already exists for this email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: invite.email,
    name,
    role: "user",
    provider: "credentials",
    passwordHash,
  });

  invite.status = "accepted";
  invite.acceptedBy = user._id;
  invite.acceptedAt = new Date();
  await invite.save();

  return NextResponse.json({ ok: true }, { status: 201 });
}
