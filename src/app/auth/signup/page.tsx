import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignUpCard } from "@/components/auth/SignUpCard";

export const metadata = { title: "Sign Up — Nexus" };

export default async function SignUpPage() {
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
      <SignUpCard />
    </div>
  );
}
