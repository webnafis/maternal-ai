import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByName, createUser, updateUserWeek } from "./db";
import { v4 as uuidv4 } from "uuid";
import { format, addWeeks } from "date-fns";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Bloom",
      credentials: {
        name: { label: "Name", type: "text" },
        pregnancyWeek: { label: "Pregnancy Week", type: "number" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.pregnancyWeek) return null;

        const name = credentials.name.trim();
        const week = parseInt(credentials.pregnancyWeek);

        if (!name || isNaN(week) || week < 1 || week > 40) return null;

        let user = await getUserByName(name);

        if (!user) {
          // Create new account
          const dueDate = format(addWeeks(new Date(), 40 - week), "yyyy-MM-dd");

          const newUser = await createUser(uuidv4(), name, week, dueDate);
          if (!newUser) return null;
          user = newUser;
        } else {
          // User exists — log them in (week may have changed, update it)
          if (user.pregnancy_week !== week) {
            await updateUserWeek(user.id, week);
            user.pregnancy_week = week;
          }
        }

        // This object matches the extended 'User' interface from next-auth.d.ts
        return {
          id: user.id,
          name: user.name,
          pregnancyWeek: user.pregnancy_week,
          dueDate: user.due_date,
          language: user.language,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // 🔔 STEP 2 UPDATE: Cleanly map the token parameters leveraging next-auth typing extensions
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.pregnancyWeek = user.pregnancyWeek;
        token.dueDate = (user as any).dueDate; // Kept custom mapping properties safe
        token.language = (user as any).language;
      }
      return token;
    },
    // 🔔 STEP 2 UPDATE: Firm typing rules mapping from JWT token right back into layout layouts
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.pregnancyWeek = token.pregnancyWeek;
        (session.user as any).dueDate = token.dueDate;
        (session.user as any).language = token.language;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
