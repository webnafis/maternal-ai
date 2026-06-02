import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { upsertMoodEntry, getMoodEntryForDate } from "@/lib/db";
import { getTodayDate } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phqScore } = await req.json();
  if (phqScore === undefined)
    return NextResponse.json({ error: "Missing phqScore" }, { status: 400 });

  const date = getTodayDate();

  await upsertMoodEntry(session.user.id, date, {
    phqScore, // only this is new
  });

  return NextResponse.json({ success: true });
}
