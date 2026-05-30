import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVaccinationRecords, upsertVaccination } from "@/lib/db";
import { VACCINES, getVaccineDefaultStatus } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const weekParam = req.nextUrl.searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : (session.user as any).pregnancyWeek || 1;

  // 🔔 UPDATE: Added 'await' because database queries are asynchronous now
  const records = await getVaccinationRecords(session.user.id);
  const recordMap = new Map(records.map((r) => [r.vaccine_id, r.status]));

  const vaccines = VACCINES.map((v) => {
    let status = recordMap.get(v.id);
    if (!status) {
      status = getVaccineDefaultStatus(v.id, currentWeek);
    }
    return {
      id: v.id,
      name: v.name,
      status: status,
      weekRange: v.when, // Maps 'when' from utils -> 'weekRange' for frontend cards
      eligibleFromWeek: v.eligibleFromWeek,
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

  // 🔔 UPDATE: Added 'await' to ensure the update hits Neon before resolving the response
  await upsertVaccination(session.user.id, vaccineId, status);
  return NextResponse.json({ success: true });
}
