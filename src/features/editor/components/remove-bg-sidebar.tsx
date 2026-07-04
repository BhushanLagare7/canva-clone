import { useState } from "react";
import Image from "next/image";

import * as fabric from "fabric";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRemoveBg } from "@/features/ai/api/use-remove-bg";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const [error, setError] = useState<string | null>(null);
  const mutation = useRemoveBg();

  const selectedObject = editor?.selectedObjects[0];

  const imageObject =
    selectedObject instanceof fabric.FabricImage ? selectedObject : null;
  const imageSrc = imageObject ? imageObject.getSrc() : null;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = () => {
    setError(null);
    // TODO: Block using paywall

    if (!imageSrc) return;

    mutation.mutate(
      { image: imageSrc },
      {
        onSuccess: ({ data }) => {
          editor?.addImage(data);
        },
        onError: (err) => {
          setError(err.message || "Failed to remove background");
        },
      },
    );
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        activeTool === "remove-bg" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Remove background from image using AI"
        title="Background removal"
      />
      {!imageSrc && (
        <div className="flex flex-1 flex-col items-center justify-center gap-y-4">
          <AlertTriangle className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-xs">
            Feature not available for this object
          </p>
        </div>
      )}
      {imageSrc && (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-4">
            <div
              className={cn(
                "bg-muted relative aspect-square overflow-hidden rounded-md transition",
                mutation.isPending && "opacity-50",
              )}
            >
              <Image alt="Image" className="object-cover" fill src={imageSrc} />
            </div>
            {error && <p className="text-destructive text-xs">{error}</p>}
            <Button
              className="w-full"
              disabled={mutation.isPending}
              onClick={onClick}
            >
              Remove background
            </Button>
          </div>
        </ScrollArea>
      )}
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
