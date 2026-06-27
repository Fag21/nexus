import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInCard } from "@/components/auth/SignInCard";

export const metadata = { title: "Sign In — Nexus" };

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--color-background-tertiary)",
      }}
    >
      <SignInCard />
    </div>
  );
}
