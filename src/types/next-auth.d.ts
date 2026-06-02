import NextAuth, { DefaultSession } from "next-auth";
import type { AppLanguage } from "@/lib/i18n/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      pregnancyWeek?: number;
      dueDate?: string | null;
      language?: AppLanguage;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    pregnancyWeek?: number;
    dueDate?: string | null;
    language?: AppLanguage;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    pregnancyWeek?: number;
    dueDate?: string | null;
    language?: AppLanguage;
  }
}
