import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Nav from "@/components/layout/Nav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { email?: string; role?: string };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Nav userEmail={user.email} isAdmin={user.role === "admin"} />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
