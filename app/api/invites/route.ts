import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { generateInviteToken, buildInviteUrl } from "@/lib/invite";
import Invite from "@/models/Invite";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const invites = await Invite.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(invites.map((i) => ({ ...i, inviteUrl: buildInviteUrl(i.token) })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  await connectDB();
  const existing = await Invite.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json(
      { error: "Invite already sent", inviteUrl: buildInviteUrl(existing.token) },
      { status: 409 }
    );
  }

  const token = generateInviteToken();
  const invite = await Invite.create({ email: email.toLowerCase(), token });
  return NextResponse.json({ invite, inviteUrl: buildInviteUrl(token) }, { status: 201 });
}
