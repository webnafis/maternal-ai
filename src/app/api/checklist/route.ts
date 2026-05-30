import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChecklistForDate, upsertChecklist } from "@/lib/db";
import { getTodayDate, CHECKLIST_ITEMS } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date") || getTodayDate();

  // 🔔 UPDATE: Added 'await' because database call is asynchronous now
  const existing = await getChecklistForDate(session.user.id, date);

  if (existing) {
    return NextResponse.json({ items: existing.items, date });
  }

  // Return default unchecked list
  return NextResponse.json({ items: CHECKLIST_ITEMS.map(() => false), date });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, date } = await req.json();
  const targetDate = date || getTodayDate();

  // 🔔 UPDATE: Added 'await' to ensure database transaction finishes before returning response
  await upsertChecklist(session.user.id, targetDate, items);

  return NextResponse.json({ success: true, items, date: targetDate });
}
