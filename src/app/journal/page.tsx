import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { JournalPage } from "@/components/journal/JournalPage";

export const metadata = { title: "Journal — Nexus" };

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  return (
    <div className="app-shell accent-journal">
      <NavBar />
      <JournalPage />
    </div>
  );
}