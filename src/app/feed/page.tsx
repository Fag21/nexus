import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { FeedPage } from "@/components/feed/FeedPage";

export const metadata = { title: "Growth Feed — Nexus" };

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  return (
    <div className="app-shell accent-feed">
      <NavBar />
      <FeedPage />
    </div>
  );
}