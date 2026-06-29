import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { AiPage } from "@/components/ai/AiPage";

export const metadata = { title: "AI Coach — Nexus" };

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  return (
    <div className="app-shell accent-ai">
      <NavBar />
      <AiPage />
    </div>
  );
}