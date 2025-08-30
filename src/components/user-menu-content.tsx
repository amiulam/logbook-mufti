"use client";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { Session } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
// import { logout } from "@/routes";
// import { edit } from "@/routes/profile";
// import { type User } from "@/types";
// import { Link, router } from "@inertiajs/react";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserMenuContentProps = {
  user: Session["user"];
};

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation();
  const router = useRouter();

  // const handleLogout = () => {
  //   cleanup();
  //   router.flushAll();
  // };

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail={true} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            className="block w-full"
            href={"#"}
            as="button"
            prefetch
            onClick={cleanup}
          >
            <Settings className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <div
          className="block w-full"
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/signin"); // redirect to login page
                },
              },
            });
          }}
        >
          <LogOut className="mr-2" />
          Log out
        </div>
      </DropdownMenuItem>
    </>
  );
}
