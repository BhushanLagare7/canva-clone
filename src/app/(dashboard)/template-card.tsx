import Image from "next/image";

import { CrownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface TemplateCardProps {
  imageSrc: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  description: string;
  width: number;
  height: number;
  isPro: boolean | null;
}

export const TemplateCard = ({
  imageSrc,
  title,
  onClick,
  disabled,
  description,
  height,
  width,
  isPro,
}: TemplateCardProps) => {
  return (
    <button
      className={cn(
        "group flex flex-col space-y-2 text-left transition",
        disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-xl border"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <Image
          alt={title}
          className="transform object-cover transition group-hover:scale-105"
          fill
          src={imageSrc}
        />
        {isPro && (
          <div className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
            <CrownIcon className="size-5 fill-yellow-500 text-yellow-500" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 backdrop-blur-sm backdrop-filter transition group-hover:opacity-100">
          <p className="font-medium text-white">Open in editor</p>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs opacity-0 transition group-hover:opacity-75">
          {description}
        </p>
      </div>
    </button>
  );
};
