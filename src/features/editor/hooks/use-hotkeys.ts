import { useEvent } from "react-use";

import * as fabric from "fabric";

interface UseHotkeysProps {
  canvas: fabric.Canvas | null;
  copy: () => void;
  paste: () => void;
  save: (skip?: boolean) => void;
  redo: () => void;
  undo: () => void;
}

export const useHotkeys = ({
  canvas,
  copy,
  paste,
  save,
  redo,
  undo,
}: UseHotkeysProps) => {
  useEvent("keydown", (event) => {
    const isCtrlKey = event.ctrlKey || event.metaKey;
    const isBackspace = event.key === "Backspace";
    const isInput = ["INPUT", "TEXTAREA"].includes(
      (event.target as HTMLElement).tagName,
    );

    if (isInput) return;

    if (isBackspace) {
      canvas?.remove(...canvas.getActiveObjects());
      canvas?.discardActiveObject();
    }

    if (isCtrlKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
    }

    if (isCtrlKey && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
    }

    if (isCtrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copy();
    }

    if (isCtrlKey && event.key.toLowerCase() === "v") {
      event.preventDefault();
      paste();
    }

    if (isCtrlKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      save(true);
    }

    if (isCtrlKey && event.key.toLowerCase() === "a") {
      event.preventDefault();
      canvas?.discardActiveObject();

      const allObjects = canvas
        ?.getObjects()
        .filter((object) => object.selectable);

      canvas?.setActiveObject(
        new fabric.ActiveSelection(allObjects, { canvas }),
      );
      canvas?.renderAll();
    }
  });
};
