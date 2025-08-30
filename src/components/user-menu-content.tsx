"use client";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { Session } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type UserMenuContentProps = {
  user: Session["user"];
};

export function UserMenuContent({ user }: UserMenuContentProps) {
  const router = useRouter();

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail={true} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {/* <DropdownMenuGroup>
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
      <DropdownMenuSeparator /> */}
      <DropdownMenuItem asChild>
        <div
          className="block w-full"
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.replace("/signin"); // redirect to login page
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
