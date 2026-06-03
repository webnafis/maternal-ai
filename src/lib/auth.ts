import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByName, getUserById, updateUserLanguage, updateUserWeek } from "./db";
import { normalizeLanguage } from "@/lib/i18n/types";
import { verifyPassword } from "./password";
import { calculateWeekFromDueDate } from "@/lib/utils";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "JotnoAI",
      credentials: {
        name: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        language: { label: "Language", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null;

        const name = credentials.name.trim();
        const user = await getUserByName(name);

        if (!user?.password_hash) return null;

        const valid = await verifyPassword(
          credentials.password,
          user.password_hash
        );
        if (!valid) return null;

        if (credentials.language) {
          const lang = normalizeLanguage(credentials.language);
          if (lang !== normalizeLanguage(user.language)) {
            await updateUserLanguage(user.id, lang);
            user.language = lang;
          }
        }

        return {
          id: user.id,
          name: user.name,
          pregnancyWeek: user.pregnancy_week,
          dueDate: user.due_date,
          language: normalizeLanguage(user.language),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.pregnancyWeek = user.pregnancyWeek;
        token.dueDate = user.dueDate;
        token.language = user.language;
      }
      if (trigger === "update" && session?.language) {
        token.language = session.language === "bn" ? "bn" : "en";
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        const freshUser = await getUserById(token.id as string);
        if (freshUser) {
          const calculatedWeek = calculateWeekFromDueDate(freshUser.due_date);
          if (calculatedWeek !== freshUser.pregnancy_week) {
            await updateUserWeek(freshUser.id, calculatedWeek);
            freshUser.pregnancy_week = calculatedWeek;
          }
          session.user.id = freshUser.id;
          session.user.pregnancyWeek = freshUser.pregnancy_week;
          session.user.dueDate = freshUser.due_date;
          session.user.language =
            freshUser.language === "bn" ? "bn" : "en";
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
