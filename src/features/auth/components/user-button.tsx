"use client";

import { signOut, useSession } from "next-auth/react";

import { CreditCardIcon, LoaderIcon, LogOutIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserButton = () => {
  const session = useSession();

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
      <DropdownMenuTrigger className="relative rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <Avatar className="size-10 transition hover:opacity-75">
          <AvatarImage alt={name} src={imageUrl || ""} />
          <AvatarFallback className="flex items-center justify-center bg-blue-500 font-medium text-white">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem className="h-10" disabled>
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
