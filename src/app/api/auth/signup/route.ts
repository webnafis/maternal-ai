import { NextRequest, NextResponse } from "next/server";
import { getUserByName, createUser } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { v4 as uuidv4 } from "uuid";
import { format, addWeeks } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { name, password, week, language } = await req.json();
    const trimmed = name?.trim();

    if (!trimmed || trimmed.length < 2) {
      return NextResponse.json(
        { error: "Username must be at least 2 characters." },
        { status: 400 }
      );
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existing = await getUserByName(trimmed);
    if (existing) {
      return NextResponse.json(
        { error: "This username is already taken. Try logging in." },
        { status: 409 }
      );
    }

    const lang = language === "bn" ? "bn" : "en";
    const pregnancyWeek = week && Number(week) >= 1 && Number(week) <= 40 ? Number(week) : 1;
    const dueDate = format(addWeeks(new Date(), 40 - pregnancyWeek), "yyyy-MM-dd");
    const passwordHash = await hashPassword(String(password));

    const user = await createUser(
      uuidv4(),
      trimmed,
      pregnancyWeek,
      dueDate,
      lang,
      passwordHash
    );

    if (!user) {
      return NextResponse.json(
        { error: "Could not create account." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, language: user.language },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}
