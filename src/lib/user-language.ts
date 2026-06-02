import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import type { AppLanguage } from "@/lib/i18n/types";
import { normalizeLanguage } from "@/lib/i18n/types";

export async function getSessionUserLanguage(): Promise<{
  userId: string;
  language: AppLanguage;
} | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await getUserById(session.user.id);
  if (!user) return null;
  return {
    userId: user.id,
    language: normalizeLanguage(user.language),
  };
}
