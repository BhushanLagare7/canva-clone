import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const font = Space_Grotesk({
  weight: ["700"],
  subsets: ["latin"],
});

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex h-17 items-center gap-x-2 px-4 transition hover:opacity-75">
        <div className="relative size-8">
          <Image alt="Image AI" fill src="/logo.svg" />
        </div>
        <h1 className={cn(font.className, "text-xl font-bold")}>Stencil</h1>
      </div>
    </Link>
  );
};
