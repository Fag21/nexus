import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata = {
  title: "Nexus — Build better habits, grow into your best self",
  description:
    "Nexus brings habits, screen-time control, journaling, reading and a personal AI coach into one beautiful place.",
};

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return <LandingPage />;
}
