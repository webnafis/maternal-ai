import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUserWeek, updateUserLanguage } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 🔔 UPDATE: Added 'await' because database call is asynchronous now
  const user = await getUserById(session.user.id);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // 🔔 UPDATE: Added 'await' to ensure database updates complete sequentially
  if (body.pregnancyWeek !== undefined) {
    await updateUserWeek(session.user.id, body.pregnancyWeek);
  }
  if (body.language !== undefined) {
    await updateUserLanguage(session.user.id, body.language);
  }

  // 🔔 UPDATE: Added 'await' to fetch the freshly updated user profile state
  const user = await getUserById(session.user.id);
  return NextResponse.json(user);
}
