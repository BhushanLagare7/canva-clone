"use client";

import { signOut, useSession } from "next-auth/react";

import {
  CreditCardIcon,
  CrownIcon,
  LoaderIcon,
  LogOutIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBilling } from "@/features/subscriptions/api/use-billing";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";

export const UserButton = () => {
  const { shouldBlock, triggerPaywall, isLoading } = usePaywall();
  const mutation = useBilling();
  const session = useSession();

  const onClick = () => {
    if (shouldBlock) {
      triggerPaywall();
      return;
    }

    mutation.mutate();
  };

  if (session.status === "loading") {
    return <LoaderIcon className="text-muted-foreground size-4 animate-spin" />;
  }

  if (session.status === "unauthenticated" || !session.data) {
    return null;
  }

  const name = session.data?.user?.name ?? "User";
  const imageUrl = session.data?.user?.image;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="focus-visible:ring-ring/50 relative rounded-full outline-none focus-visible:ring-3">
        {!shouldBlock && !isLoading && (
          <div className="absolute -top-1 -left-1 z-10 flex items-center justify-center">
            <div className="flex items-center justify-center rounded-full bg-white p-1 drop-shadow-sm">
              <CrownIcon className="size-3 fill-yellow-500 text-yellow-500" />
            </div>
          </div>
        )}
        <Avatar className="size-10 transition hover:opacity-75">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="flex items-center justify-center bg-blue-500 font-medium text-white">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          className="h-10"
          disabled={mutation.isPending}
          onClick={onClick}
        >
          <CreditCardIcon className="mr-2 size-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-10" onClick={() => signOut()}>
          <LogOutIcon className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
