import Image from "next/image";

import { AlertTriangleIcon, CrownIcon, LoaderIcon } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import {
  ResponseType,
  useGetTemplates,
} from "@/features/projects/api/use-get-templates";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TemplateSidebarProps) => {
  const { shouldBlock, triggerPaywall } = usePaywall();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to replace the current project with this template.",
  );

  const { data, isLoading, isError } = useGetTemplates({
    limit: "20",
    page: "1",
  });

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async (template: ResponseType["data"][0]) => {
    if (template.isPro && shouldBlock) {
      triggerPaywall();

      return;
    }

    const ok = await confirm();

    if (ok) {
      try {
        await editor?.loadJson(template.json);
      } catch (error) {
        console.error("Failed to load template:", error);
      }
    }
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        activeTool === "templates" ? "visible" : "hidden",
      )}
    >
      <ConfirmDialog />
      <ToolSidebarHeader
        description="Choose from a variety of templates to get started"
        title="Templates"
      />
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <LoaderIcon className="text-muted-foreground size-4 animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-1 flex-col items-center justify-center gap-y-4">
          <AlertTriangleIcon className="text-muted-foreground size-4" />
          <p className="text-muted-foreground text-xs">
            Failed to fetch templates
          </p>
        </div>
      )}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data &&
              data.map((template) => {
                return (
                  <button
                    key={template.id}
                    className="group bg-muted relative w-full overflow-hidden rounded-sm border transition hover:opacity-75"
                    style={{
                      aspectRatio: `${template.width}/${template.height}`,
                    }}
                    onClick={() => onClick(template)}
                  >
                    {template.thumbnailUrl ? (
                      <Image
                        alt={template.name ?? "Template"}
                        className="object-cover"
                        fill
                        src={template.thumbnailUrl}
                      />
                    ) : null}
                    {template.isPro && (
                      <div className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/50">
                        <CrownIcon className="size-4 fill-yellow-500 text-yellow-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full truncate bg-black/50 p-1 text-left text-[10px] text-white opacity-0 group-hover:opacity-100">
                      {template.name}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
