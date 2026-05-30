import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only-sidebar">
        <Sidebar userName={user.name} pregnancyWeek={user.pregnancy_week} />
      </div>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar
          userId={user.id}
          userName={user.name}
          pregnancyWeek={user.pregnancy_week}
        />
        <div style={{ flex: 1, paddingBottom: 80 }}>{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      <style>{`
        @media (min-width: 769px) {
          .desktop-only-sidebar { display: block; }
          main { margin-left: 260px !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only-sidebar { display: none; }
          main { margin-left: 0 !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
