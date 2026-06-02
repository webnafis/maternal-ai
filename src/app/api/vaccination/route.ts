import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVaccinationRecords, upsertVaccination } from "@/lib/db";
import { VACCINES } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekParam = req.nextUrl.searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : (session.user as any).pregnancyWeek || 1;

  const records = await getVaccinationRecords(session.user.id);
  const recordMap = new Map(records.map((r) => [r.vaccine_id, r.status]));

  // Insert default records for any vaccines not yet in the database.
  // Default: due if currentWeek >= eligibleFromWeek, else upcoming.
  // "done" is never a default — only the user can mark something done.
  const missingVaccines = VACCINES.filter((v) => !recordMap.has(v.id));
  if (missingVaccines.length > 0) {
    await Promise.all(
      missingVaccines.map((v) => {
        const defaultStatus: "due" | "upcoming" =
          currentWeek >= v.eligibleFromWeek ? "due" : "upcoming";
        recordMap.set(v.id, defaultStatus); // keep in-memory map in sync
        return upsertVaccination(session.user.id, v.id, defaultStatus);
      })
    );
  }

  // Build vaccine list.
  // Rule: only "done" from the DB is trusted as-is.
  // due/upcoming is always recalculated from currentWeek so it stays accurate
  // as the pregnancy progresses without requiring a user action.
  const vaccines = VACCINES.map((v) => {
    const dbStatus = recordMap.get(v.id);
    const status: "done" | "due" | "upcoming" =
      dbStatus === "done"
        ? "done"
        : currentWeek >= v.eligibleFromWeek
        ? "due"
        : "upcoming";

    return {
      id: v.id,
      name: v.name,
      status,
      weekRange: v.when,
      eligibleFromWeek: v.eligibleFromWeek,
      description: v.description,
    };
  });

  return NextResponse.json({ vaccines });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { vaccineId, status } = await req.json();

  if (!vaccineId || !["done", "due", "upcoming"].includes(status)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await upsertVaccination(session.user.id, vaccineId, status);
  return NextResponse.json({ success: true });
}
