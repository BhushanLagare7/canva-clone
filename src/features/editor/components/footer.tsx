import { MinimizeIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Editor } from "@/features/editor/types";

interface FooterProps {
  editor: Editor | undefined;
}

export const Footer = ({ editor }: FooterProps) => {
  return (
    <footer className="z-49 flex h-13 w-full shrink-0 flex-row-reverse items-center gap-x-1 overflow-x-auto border-t bg-white p-2 px-4">
      <Hint label="Reset" side="top" sideOffset={10}>
        <Button
          aria-label="Reset"
          className="h-full"
          size="icon"
          variant="ghost"
          onClick={() => editor?.autoZoom()}
        >
          <MinimizeIcon className="size-4" />
        </Button>
      </Hint>
      <Hint label="Zoom in" side="top" sideOffset={10}>
        <Button
          aria-label="Zoom in"
          className="h-full"
          size="icon"
          variant="ghost"
          onClick={() => editor?.zoomIn()}
        >
          <ZoomInIcon className="size-4" />
        </Button>
      </Hint>
      <Hint label="Zoom out" side="top" sideOffset={10}>
        <Button
          aria-label="Zoom out"
          className="h-full"
          size="icon"
          variant="ghost"
          onClick={() => editor?.zoomOut()}
        >
          <ZoomOutIcon className="size-4" />
        </Button>
      </Hint>
    </footer>
  );
};
