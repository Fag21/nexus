import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export const metadata = { title: "Dashboard — Nexus" };

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  return (
    <div className="app-shell accent-dashboard">
      <NavBar />
      <DashboardPage />
    </div>
  );
}