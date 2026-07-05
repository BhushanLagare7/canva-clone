import { useEffect } from "react";

import * as fabric from "fabric";

interface UseCanvasEventsProps {
  save: () => void;
  canvas: fabric.Canvas | null;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  clearSelectionCallback?: () => void;
}

export const useCanvasEvents = ({
  save,
  canvas,
  setSelectedObjects,
  clearSelectionCallback,
}: UseCanvasEventsProps) => {
  useEffect(() => {
    if (canvas) {
      const handleObjectAdded = () => save();
      const handleObjectRemoved = () => save();
      const handleObjectModified = () => save();
      const handleSelectionCreated = (e: fabric.CanvasEvents["selection:created"]) => {
        setSelectedObjects(e.selected || []);
      };
      const handleSelectionUpdated = (e: fabric.CanvasEvents["selection:updated"]) => {
        setSelectedObjects(e.selected || []);
      };
      const handleSelectionCleared = () => {
        setSelectedObjects([]);
        clearSelectionCallback?.();
      };

      canvas.on("object:added", handleObjectAdded);
      canvas.on("object:removed", handleObjectRemoved);
      canvas.on("object:modified", handleObjectModified);
      canvas.on("selection:created", handleSelectionCreated);
      canvas.on("selection:updated", handleSelectionUpdated);
      canvas.on("selection:cleared", handleSelectionCleared);

      return () => {
        canvas.off("object:added", handleObjectAdded);
        canvas.off("object:removed", handleObjectRemoved);
        canvas.off("object:modified", handleObjectModified);
        canvas.off("selection:created", handleSelectionCreated);
        canvas.off("selection:updated", handleSelectionUpdated);
        canvas.off("selection:cleared", handleSelectionCleared);
      };
    }
  }, [
    save,
    canvas,
    clearSelectionCallback,
    setSelectedObjects,
  ]);
};
