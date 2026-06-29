import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { SocialPage } from "@/components/social/SocialPage";

export const metadata = { title: "Social — Nexus" };

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  return (
    <div className="app-shell accent-social">
      <NavBar />
      <SocialPage />
    </div>
  );
}
