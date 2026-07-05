import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "@/features/editor/components/color-picker";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const SettingsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: SettingsSidebarProps) => {
  const workspace = editor?.getWorkspace();

  const initialWidth = useMemo(() => `${workspace?.width ?? 0}`, [workspace]);
  const initialHeight = useMemo(() => `${workspace?.height ?? 0}`, [workspace]);
  const initialBackground = useMemo(
    () => workspace?.fill ?? "#ffffff",
    [workspace],
  );

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [background, setBackground] = useState(initialBackground);

  // Track previous values to adjust state during render (avoids useEffect + setState)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevInitialWidth, setPrevInitialWidth] = useState(initialWidth);
  const [prevInitialHeight, setPrevInitialHeight] = useState(initialHeight);
  const [prevInitialBackground, setPrevInitialBackground] =
    useState(initialBackground);

  if (prevInitialWidth !== initialWidth) {
    setPrevInitialWidth(initialWidth);
    setWidth(initialWidth);
  }

  if (prevInitialHeight !== initialHeight) {
    setPrevInitialHeight(initialHeight);
    setHeight(initialHeight);
  }

  if (prevInitialBackground !== initialBackground) {
    setPrevInitialBackground(initialBackground);
    setBackground(initialBackground);
  }

  const changeBackground = (value: string) => {
    setBackground(value);
    editor?.changeBackground(value);
  };

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    editor?.changeSize({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        activeTool === "settings" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Change the look of your workspace"
        title="Settings"
      />
      <ScrollArea className="min-h-0 flex-1">
        <form className="space-y-4 p-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Height</Label>
            <Input
              placeholder="Height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Width</Label>
            <Input
              placeholder="Width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit">
            Resize
          </Button>
        </form>
        <div className="p-4">
          <ColorPicker
            value={background as string} // We dont support gradients or patterns
            onChange={changeBackground}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
