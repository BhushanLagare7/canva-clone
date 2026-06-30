"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Canvas } from "fabric";

import { Footer } from "@/features/editor/components/footer";
import { Navbar } from "@/features/editor/components/navbar";
import { Sidebar } from "@/features/editor/components/sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { ActiveTool } from "@/features/editor/types";

export const Editor = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        // TODO: Enable draw mode
      }

      if (activeTool === "draw") {
        // TODO: Disable draw mode
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool],
  );

  const { init } = useEditor();

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
        <main className="bg-muted relative flex flex-1 flex-col overflow-auto">
          <Toolbar />
          <div
            ref={container}
            className="bg-muted relative h-[calc(100%-124px)] min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <canvas ref={canvasRef} />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
