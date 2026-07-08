import { useCallback, useRef, useState } from "react";

import * as fabric from "fabric";

import { JSON_KEYS } from "@/features/editor/types";

interface UseHistoryProps {
  canvas: fabric.Canvas | null;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
  }) => void;
}

export const useHistory = ({ canvas, saveCallback }: UseHistoryProps) => {
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasHistoryRef = useRef<string[]>([]);
  const skipSave = useRef(false);

  const canUndo = useCallback(() => {
    return historyIndex > 0;
  }, [historyIndex]);

  const canRedo = useCallback(() => {
    return historyIndex < canvasHistoryRef.current.length - 1;
  }, [historyIndex]);

  const save = useCallback(
    (skip = false) => {
      if (!canvas) return;

      const currentState = canvas.toObject(JSON_KEYS);
      const json = JSON.stringify(currentState);

      if (!skip && !skipSave.current) {
        canvasHistoryRef.current.splice(historyIndex + 1);
        canvasHistoryRef.current.push(json);
        setHistoryIndex(canvasHistoryRef.current.length - 1);
      }

      const workspace = canvas
        .getObjects()
        .find(
          (object) =>
            (object as fabric.FabricObject & { name?: string }).name === "clip",
        );
      const height = workspace?.height ?? 0;
      const width = workspace?.width ?? 0;

      saveCallback?.({ json, height, width });
    },
    [canvas, historyIndex, saveCallback],
  );

  const undo = useCallback(async () => {
    if (canUndo() && canvas) {
      skipSave.current = true;
      canvas.clear();
      canvas.renderAll();

      const previousIndex = historyIndex - 1;
      const previousState = JSON.parse(canvasHistoryRef.current[previousIndex]);

      await canvas.loadFromJSON(previousState);
      canvas.renderAll();
      setHistoryIndex(previousIndex);
      skipSave.current = false;
    }
  }, [canUndo, canvas, historyIndex]);

  const redo = useCallback(async () => {
    if (canRedo() && canvas) {
      skipSave.current = true;
      canvas.clear();
      canvas.renderAll();

      const nextIndex = historyIndex + 1;
      const nextState = JSON.parse(canvasHistoryRef.current[nextIndex]);

      await canvas.loadFromJSON(nextState);
      canvas.renderAll();
      setHistoryIndex(nextIndex);
      skipSave.current = false;
    }
  }, [canvas, historyIndex, canRedo]);

  return {
    save,
    canUndo,
    canRedo,
    undo,
    redo,
    setHistoryIndex,
    canvasHistoryRef,
  };
};
