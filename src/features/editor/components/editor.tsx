"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Canvas } from "fabric";

import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { Footer } from "@/features/editor/components/footer";
import { Navbar } from "@/features/editor/components/navbar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { Sidebar } from "@/features/editor/components/sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { ActiveTool, selectionDependentTools } from "@/features/editor/types";

export const Editor = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === activeTool) {
        if (activeTool === "draw") {
          // TODO: Disable draw mode
        }

        return setActiveTool("select");
      }

      if (tool === "draw") {
        // TODO: Enable draw mode
      } else if (activeTool === "draw") {
        // TODO: Disable draw mode
      }

      setActiveTool(tool);
    },
    [activeTool],
  );

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    clearSelectionCallback: onClearSelection,
  });

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
      <Navbar activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
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
          <Footer />
        </main>
      </div>
    </div>
  );
};
