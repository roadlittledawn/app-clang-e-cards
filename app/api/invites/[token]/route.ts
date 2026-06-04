import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invite from "@/models/Invite";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  await connectDB();
  const invite = await Invite.findOne({ token }).lean();
  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.status === "accepted") {
    return NextResponse.json({ error: "This invite has already been accepted" }, { status: 410 });
  }
  return NextResponse.json({ email: invite.email, status: invite.status });
}
