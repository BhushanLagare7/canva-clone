import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateImage } from "@/features/ai/api/use-generate-image";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const AiSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AiSidebarProps) => {
  const mutation = useGenerateImage();
  const { shouldBlock, triggerPaywall } = usePaywall();

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (shouldBlock) {
      triggerPaywall();

      return;
    }

    mutation.mutate(
      { prompt: value },
      {
        onSuccess: ({ data }) => {
          if (data) {
            editor?.addImage(data);
          }
        },
        onError: (err) => {
          setError(err.message || "Failed to generate image");
        },
      },
    );
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        activeTool === "ai" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader description="Generate an image using AI" title="AI" />
      <ScrollArea className="min-h-0 flex-1">
        <form className="space-y-6 p-4" onSubmit={onSubmit}>
          <Textarea
            cols={30}
            disabled={mutation.isPending}
            minLength={3}
            placeholder="An astronaut riding a horse on mars, hd, dramatic lighting"
            required
            rows={10}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button
            className="w-full"
            disabled={mutation.isPending}
            type="submit"
          >
            Generate
          </Button>
        </form>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
