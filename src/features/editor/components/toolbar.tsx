import { useState } from "react";
import { BsBorderWidth } from "react-icons/bs";
import { FaBold, FaItalic, FaStrikethrough, FaUnderline } from "react-icons/fa";
import { RxTransparencyGrid } from "react-icons/rx";
import { TbColorFilter } from "react-icons/tb";

import type * as fabric from "fabric";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  CopyIcon,
  SquareSplitHorizontalIcon,
  TrashIcon,
} from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { FontSizeInput } from "@/features/editor/components/font-size-input";
import {
  ActiveTool,
  Editor,
  FONT_SIZE,
  FONT_WEIGHT,
} from "@/features/editor/types";
import { isTextType } from "@/features/editor/utils";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  /** The tool currently active in the editor sidebar (drives active-state styling). */
  activeTool: ActiveTool;
  /** The editor instance backing the canvas; `undefined` while it is initializing. */
  editor: Editor | undefined;
  /** Callback used to switch the active sidebar tool. */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

/** Shape of the toolbar's locally-mirrored editor properties. */
type ToolbarProperties = {
  fillColor: string | undefined;
  fontFamily: string | undefined;
  fontLinethrough: boolean;
  fontSize: number;
  fontStyle: string;
  fontUnderline: boolean;
  fontWeight: number;
  strokeColor: string | undefined;
  textAlign: fabric.TextProps["textAlign"] | "left";
};

/**
 * Reads the currently active object's styling properties off the editor,
 * falling back to sensible defaults when there is no editor/selection yet.
 * Used both for the toolbar's initial state and whenever the selection changes.
 */
const getEditorProperties = (
  editor: Editor | undefined,
): ToolbarProperties => ({
  fillColor: editor?.getActiveFillColor(),
  fontFamily: editor?.getActiveFontFamily(),
  fontLinethrough: editor?.getActiveFontLinethrough() ?? false,
  fontSize: editor?.getActiveFontSize() ?? FONT_SIZE,
  fontStyle: editor?.getActiveFontStyle() ?? "normal",
  fontUnderline: editor?.getActiveFontUnderline() ?? false,
  fontWeight: editor?.getActiveFontWeight() ?? FONT_WEIGHT,
  strokeColor: editor?.getActiveStrokeColor(),
  textAlign: editor?.getActiveTextAlign() ?? "left",
});

interface ToolbarIconButtonProps {
  /** Tooltip text and accessible label for the button. */
  label: string;
  /** Icon component rendered inside the button. */
  icon: React.ComponentType<{ className?: string }>;
  /** Whether the button should render in its "active" (highlighted) state. */
  isActive?: boolean;
  /** Click handler for the button. */
  onClick: () => void;
}

/**
 * A single icon button in the toolbar, wrapped in a tooltip (`Hint`) and
 * centered in its own slot. Extracted to avoid repeating the identical
 * wrapper markup for every toolbar action.
 */
const ToolbarIconButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
}: ToolbarIconButtonProps) => (
  <div className="flex h-full items-center justify-center">
    <Hint label={label} side="bottom" sideOffset={5}>
      <Button
        className={cn(isActive && "bg-gray-100")}
        size="icon"
        variant="ghost"
        onClick={onClick}
      >
        <Icon className="size-4" />
      </Button>
    </Hint>
  </div>
);

/**
 * Contextual formatting toolbar shown above the canvas. Its contents adapt
 * to the type of the currently selected object (text, image, shape, etc.)
 * and mirror the selected object's styling into local state so inputs like
 * font size can be edited responsively.
 */
export const Toolbar = ({
  activeTool,
  editor,
  onChangeActiveTool,
}: ToolbarProps) => {
  // Lazy initializer: only runs once on mount, rather than being
  // recomputed (and discarded) on every re-render.
  const [properties, setProperties] = useState<ToolbarProperties>(() =>
    getEditorProperties(editor),
  );

  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = selectedObject?.type;
  const isText = isTextType(selectedObjectType);
  const isImage = selectedObjectType === "image";

  // Re-sync local properties whenever the selection changes (not on every
  // in-place property mutation, since `selectedObject` keeps its reference
  // while the user is e.g. typing into the font size input). Adjusting state
  // during render (rather than in an effect) avoids an extra render pass.
  const [prevSelectedObject, setPrevSelectedObject] = useState(selectedObject);
  if (selectedObject !== prevSelectedObject) {
    setPrevSelectedObject(selectedObject);
    setProperties(getEditorProperties(editor));
  }

  /**
   * Applies a text property change through the editor and mirrors it into
   * local state, guarding on there being a selected text object. Centralizes
   * the repeated guard + editor-call + setProperties pattern shared by the
   * toggle/align/size handlers below.
   */
  const applyTextChange = <K extends keyof ToolbarProperties>(
    key: K,
    value: ToolbarProperties[K],
    apply: () => void,
  ) => {
    if (!selectedObject || !isText) return;

    apply();
    setProperties((current) => ({ ...current, [key]: value }));
  };

  const toggleBold = () => {
    const newWeight = properties.fontWeight > 500 ? 500 : 700;
    applyTextChange("fontWeight", newWeight, () =>
      editor?.changeFontWeight(newWeight),
    );
  };

  const toggleItalic = () => {
    const newStyle = properties.fontStyle === "italic" ? "normal" : "italic";
    applyTextChange("fontStyle", newStyle, () =>
      editor?.changeFontStyle(newStyle),
    );
  };

  const toggleUnderline = () => {
    const newUnderline = !properties.fontUnderline;
    applyTextChange("fontUnderline", newUnderline, () =>
      editor?.changeFontUnderline(newUnderline),
    );
  };

  const toggleLinethrough = () => {
    const newLinethrough = !properties.fontLinethrough;
    applyTextChange("fontLinethrough", newLinethrough, () =>
      editor?.changeFontLinethrough(newLinethrough),
    );
  };

  const onChangeTextAlign = (align: fabric.TextProps["textAlign"]) => {
    applyTextChange("textAlign", align, () => editor?.changeTextAlign(align));
  };

  const onChangeFontSize = (size: number) => {
    applyTextChange("fontSize", size, () => editor?.changeFontSize(size));
  };

  const onDuplicate = async () => {
    await editor?.onCopy();
    await editor?.onPaste();
  };

  if (editor?.selectedObjects.length === 0) {
    return (
      <div className="z-49 flex h-14 w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2" />
    );
  }

  return (
    <div className="z-49 flex h-14 w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2">
      {!isImage && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Color" side="bottom" sideOffset={5}>
            <Button
              className={cn(activeTool === "fill" && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={() => onChangeActiveTool("fill")}
            >
              <div
                className="size-4 rounded-sm border"
                style={{ backgroundColor: properties.fillColor }}
              />
            </Button>
          </Hint>
        </div>
      )}

      {!isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Stroke color" side="bottom" sideOffset={5}>
            <Button
              className={cn(activeTool === "stroke-color" && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={() => onChangeActiveTool("stroke-color")}
            >
              <div
                className="size-4 rounded-sm border-2 bg-white"
                style={{ borderColor: properties.strokeColor }}
              />
            </Button>
          </Hint>
        </div>
      )}

      {!isText && (
        <ToolbarIconButton
          icon={BsBorderWidth}
          isActive={activeTool === "stroke-width"}
          label="Stroke width"
          onClick={() => onChangeActiveTool("stroke-width")}
        />
      )}

      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Font" side="bottom" sideOffset={5}>
            <Button
              className={cn(
                "w-auto px-2 text-sm",
                activeTool === "font" && "bg-gray-100",
              )}
              size="icon"
              variant="ghost"
              onClick={() => onChangeActiveTool("font")}
            >
              <div className="max-w-25 truncate">{properties.fontFamily}</div>
              <ChevronDownIcon className="ml-2 size-4 shrink-0" />
            </Button>
          </Hint>
        </div>
      )}

      {isText && (
        <ToolbarIconButton
          icon={FaBold}
          isActive={properties.fontWeight > 500}
          label="Bold"
          onClick={toggleBold}
        />
      )}

      {isText && (
        <ToolbarIconButton
          icon={FaItalic}
          isActive={properties.fontStyle === "italic"}
          label="Italic"
          onClick={toggleItalic}
        />
      )}

      {isText && (
        <ToolbarIconButton
          icon={FaUnderline}
          isActive={properties.fontUnderline}
          label="Underline"
          onClick={toggleUnderline}
        />
      )}

      {isText && (
        <ToolbarIconButton
          icon={FaStrikethrough}
          isActive={properties.fontLinethrough}
          label="Strike"
          onClick={toggleLinethrough}
        />
      )}

      {isText && (
        <ToolbarIconButton
          icon={AlignLeftIcon}
          isActive={properties.textAlign === "left"}
          label="Align left"
          onClick={() => onChangeTextAlign("left")}
        />
      )}

      {isText && (
        <ToolbarIconButton
          icon={AlignCenterIcon}
          isActive={properties.textAlign === "center"}
          label="Align center"
          onClick={() => onChangeTextAlign("center")}
        />
      )}

      {isText && (
        <ToolbarIconButton
          icon={AlignRightIcon}
          isActive={properties.textAlign === "right"}
          label="Align right"
          onClick={() => onChangeTextAlign("right")}
        />
      )}

      {isText && (
        <div className="flex h-full items-center justify-center">
          <FontSizeInput
            value={properties.fontSize}
            onChange={onChangeFontSize}
          />
        </div>
      )}

      {isImage && (
        <ToolbarIconButton
          icon={TbColorFilter}
          isActive={activeTool === "filter"}
          label="Filters"
          onClick={() => onChangeActiveTool("filter")}
        />
      )}

      {isImage && (
        <ToolbarIconButton
          icon={SquareSplitHorizontalIcon}
          isActive={activeTool === "remove-bg"}
          label="Remove background"
          onClick={() => onChangeActiveTool("remove-bg")}
        />
      )}

      <ToolbarIconButton
        icon={ArrowUpIcon}
        label="Bring forward"
        onClick={() => editor?.bringForward()}
      />

      <ToolbarIconButton
        icon={ArrowDownIcon}
        label="Send backwards"
        onClick={() => editor?.sendBackwards()}
      />

      <ToolbarIconButton
        icon={RxTransparencyGrid}
        isActive={activeTool === "opacity"}
        label="Opacity"
        onClick={() => onChangeActiveTool("opacity")}
      />

      <ToolbarIconButton
        icon={CopyIcon}
        label="Duplicate"
        onClick={onDuplicate}
      />

      <ToolbarIconButton
        icon={TrashIcon}
        label="Delete"
        onClick={() => editor?.delete()}
      />
    </div>
  );
};
