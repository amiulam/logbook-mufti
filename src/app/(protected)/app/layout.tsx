import { AppHeader } from "@/components/app-header";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Logbook App - Dashboard",
  description: "Professional event management and tool tracking application",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 md:max-w-7xl">{children}</div>
    </div>
  );
}
