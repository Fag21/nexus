import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { HabitsPage } from "@/components/habits/HabitsPage";

export const metadata = { title: "Habits — Nexus" };

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  return (
    <div className="app-shell accent-habits">
      <NavBar />
      <HabitsPage />
    </div>
  );
}