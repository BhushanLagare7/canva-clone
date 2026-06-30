"use client";

import { useEffect, useRef } from "react";

import { Canvas } from "fabric";

import { useEditor } from "@/features/editor/hooks/use-editor";

export const Editor = () => {
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
    <div className="flex h-full flex-col">
      <div ref={container} className="bg-muted h-full flex-1">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
