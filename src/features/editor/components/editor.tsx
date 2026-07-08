"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Canvas } from "fabric";
import debounce from "lodash.debounce";

import { AiSidebar } from "@/features/editor/components/ai-sidebar";
import { DrawSidebar } from "@/features/editor/components/draw-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { Footer } from "@/features/editor/components/footer";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { Navbar } from "@/features/editor/components/navbar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { RemoveBgSidebar } from "@/features/editor/components/remove-bg-sidebar";
import { SettingsSidebar } from "@/features/editor/components/settings-sidebar";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { Sidebar } from "@/features/editor/components/sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { ActiveTool, selectionDependentTools } from "@/features/editor/types";
import { ResponseType } from "@/features/projects/api/use-get-project";
import { useUpdateProject } from "@/features/projects/api/use-update-project";

interface EditorProps {
  initialData: ResponseType["data"];
}

export const Editor = ({ initialData }: EditorProps) => {
  const { mutate } = useUpdateProject(initialData.id);

  const debouncedSave = useMemo(
    () =>
      debounce((values: { json: string; height: number; width: number }) => {
        mutate(values);
      }, 500),
    [mutate],
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    clearSelectionCallback: onClearSelection,
    saveCallback: debouncedSave,
  });

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enableDrawingMode();
      }

      if (activeTool === "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, editor],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !container.current) return;

    const canvas = new Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: container.current,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        activeTool={activeTool}
        editor={editor}
        id={initialData.id}
        onChangeActiveTool={onChangeActiveTool}
      />
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <AiSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <RemoveBgSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <SettingsSidebar
          activeTool={activeTool}
          editor={editor}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted relative flex flex-1 flex-col overflow-auto">
          <Toolbar
            activeTool={activeTool}
            editor={editor}
            onChangeActiveTool={onChangeActiveTool}
          />
          <div
            ref={container}
            className="bg-muted relative min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <canvas ref={canvasRef} />
          </div>
          <Footer editor={editor} />
        </main>
      </div>
    </div>
  );
};
