import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch("https://api.imgflip.com/get_memes");
  const data = await res.json();
  return NextResponse.json(data);
}
