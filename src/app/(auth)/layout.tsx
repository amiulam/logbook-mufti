import { auth } from "@/lib/auth";
import { ClipboardClock } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/app/events");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-5 md:max-w-3xl">
        <div className="flex items-center justify-center gap-x-2">
          <ClipboardClock className="text-blue-500" />
          <h1 className="text-center text-2xl font-bold lg:text-3xl">
            Logbook App
          </h1>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
