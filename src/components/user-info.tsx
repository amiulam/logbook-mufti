import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Session } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

export function UserInfo({
  user,
  showEmail = false,
}: {
  user: Session["user"];
  showEmail?: boolean;
}) {
  return (
    <>
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        <AvatarImage src={user.image as string} alt={user.name} />
        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        {showEmail && (
          <span className="text-muted-foreground truncate text-xs">
            {user.email}
          </span>
        )}
      </div>
    </>
  );
}
