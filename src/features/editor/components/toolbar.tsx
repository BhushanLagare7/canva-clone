import { useState } from "react";
import { BsBorderWidth } from "react-icons/bs";
import { FaBold, FaItalic, FaStrikethrough, FaUnderline } from "react-icons/fa";
import { RxTransparencyGrid } from "react-icons/rx";

import * as fabric from "fabric";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
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
  activeTool: ActiveTool;
  editor: Editor | undefined;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const Toolbar = ({
  activeTool,
  editor,
  onChangeActiveTool,
}: ToolbarProps) => {
  const initialFillColor = editor?.getActiveFillColor();
  const initialFontFamily = editor?.getActiveFontFamily();
  const initialFontLinethrough = editor?.getActiveFontLinethrough() ?? false;
  const initialFontSize = editor?.getActiveFontSize() ?? FONT_SIZE;
  const initialFontStyle = editor?.getActiveFontStyle() ?? "normal";
  const initialFontUnderline = editor?.getActiveFontUnderline() ?? false;
  const initialFontWeight = editor?.getActiveFontWeight() ?? FONT_WEIGHT;
  const initialStrokeColor = editor?.getActiveStrokeColor();
  const initialTextAlign = editor?.getActiveTextAlign() ?? "left";

  const [properties, setProperties] = useState({
    fillColor: initialFillColor,
    fontFamily: initialFontFamily,
    fontLinethrough: initialFontLinethrough,
    fontSize: initialFontSize,
    fontStyle: initialFontStyle,
    fontUnderline: initialFontUnderline,
    fontWeight: initialFontWeight,
    strokeColor: initialStrokeColor,
    textAlign: initialTextAlign,
  });

  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = selectedObject?.type;
  const isText = isTextType(selectedObjectType);

  const toggleBold = () => {
    if (!selectedObject) return;

    const newWeight = properties.fontWeight > 500 ? 500 : 700;
    if (isText) {
      editor?.changeFontWeight(newWeight);
      setProperties((current) => ({ ...current, fontWeight: newWeight }));
    }
  };

  const toggleItalic = () => {
    if (!selectedObject) return;

    const newStyle = properties.fontStyle === "italic" ? "normal" : "italic";
    if (isText) {
      editor?.changeFontStyle(newStyle);
      setProperties((current) => ({ ...current, fontStyle: newStyle }));
    }
  };

  const toggleUnderline = () => {
    if (!selectedObject) return;

    const newUnderline = !properties.fontUnderline;
    if (isText) {
      editor?.changeFontUnderline(newUnderline);
      setProperties((current) => ({ ...current, fontUnderline: newUnderline }));
    }
  };

  const toggleLinethrough = () => {
    if (!selectedObject) return;

    const newLinethrough = !properties.fontLinethrough;
    if (isText) {
      editor?.changeFontLinethrough(newLinethrough);
      setProperties((current) => ({
        ...current,
        fontLinethrough: newLinethrough,
      }));
    }
  };

  const onChangeTextAlign = (align: fabric.TextProps["textAlign"]) => {
    if (!selectedObject) return;
    if (!isText) return;

    editor?.changeTextAlign(align);
    setProperties((current) => ({ ...current, textAlign: align }));
  };

  if (editor?.selectedObjects.length === 0) {
    return (
      <div className="z-49 flex h-14 w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2" />
    );
  }

  const onChangeFontSize = (size: number) => {
    if (!selectedObject) return;
    if (!isText) return;
    editor?.changeFontSize(size);
    setProperties((current) => ({ ...current, fontSize: size }));
  };

  return (
    <div className="z-49 flex h-14 w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2">
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
              style={{
                backgroundColor: properties.fillColor,
              }}
            />
          </Button>
        </Hint>
      </div>
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
        <div className="flex h-full items-center justify-center">
          <Hint label="Stroke width" side="bottom" sideOffset={5}>
            <Button
              className={cn(activeTool === "stroke-width" && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={() => onChangeActiveTool("stroke-width")}
            >
              <BsBorderWidth className="size-4" />
            </Button>
          </Hint>
        </div>
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
        <div className="flex h-full items-center justify-center">
          <Hint label="Bold" side="bottom" sideOffset={5}>
            <Button
              className={cn(properties.fontWeight > 500 && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={toggleBold}
            >
              <FaBold className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Italic" side="bottom" sideOffset={5}>
            <Button
              className={cn(properties.fontStyle === "italic" && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={toggleItalic}
            >
              <FaItalic className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Underline" side="bottom" sideOffset={5}>
            <Button
              className={cn(properties.fontUnderline && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={toggleUnderline}
            >
              <FaUnderline className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Strike" side="bottom" sideOffset={5}>
            <Button
              className={cn(properties.fontLinethrough && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={toggleLinethrough}
            >
              <FaStrikethrough className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Align left" side="bottom" sideOffset={5}>
            <Button
              className={cn(properties.textAlign === "left" && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={() => onChangeTextAlign("left")}
            >
              <AlignLeftIcon className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Align center" side="bottom" sideOffset={5}>
            <Button
              className={cn(properties.textAlign === "center" && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={() => onChangeTextAlign("center")}
            >
              <AlignCenterIcon className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <Hint label="Align right" side="bottom" sideOffset={5}>
            <Button
              className={cn(properties.textAlign === "right" && "bg-gray-100")}
              size="icon"
              variant="ghost"
              onClick={() => onChangeTextAlign("right")}
            >
              <AlignRightIcon className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex h-full items-center justify-center">
          <FontSizeInput
            value={properties.fontSize}
            onChange={onChangeFontSize}
          />
        </div>
      )}
      <div className="flex h-full items-center justify-center">
        <Hint label="Bring forward" side="bottom" sideOffset={5}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor?.bringForward()}
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Send backwards" side="bottom" sideOffset={5}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor?.sendBackwards()}
          >
            <ArrowDownIcon className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Opacity" side="bottom" sideOffset={5}>
          <Button
            className={cn(activeTool === "opacity" && "bg-gray-100")}
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("opacity")}
          >
            <RxTransparencyGrid className="size-4" />
          </Button>
        </Hint>
      </div>
    </div>
  );
};
