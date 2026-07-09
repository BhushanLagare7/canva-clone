import { useEffect, useRef } from "react";

import * as fabric from "fabric";

import { JSON_KEYS } from "@/features/editor/types";

interface UseLoadStateProps {
  autoZoom: () => void;
  canvas: fabric.Canvas | null;
  initialState: React.RefObject<string | undefined>;
  canvasHistory: React.RefObject<string[]>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Hook to handle the initial loading of the canvas state from JSON.
 * Ensures the canvas is populated with data once upon initialization.
 */
export const useLoadState = ({
  canvas,
  autoZoom,
  initialState,
  canvasHistory,
  setHistoryIndex,
}: UseLoadStateProps) => {
  // Track if initial load has already occurred to prevent re-runs
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialState?.current && canvas) {
      const data = JSON.parse(initialState.current);

      canvas.loadFromJSON(data).then(() => {
        // Create initial history snapshot using filtered keys
        const currentState = JSON.stringify(canvas.toObject(JSON_KEYS));

        canvasHistory.current = [currentState];
        setHistoryIndex(0);

        // Adjust zoom level to fit the loaded content
        autoZoom();
      }).catch((error) => {
        console.error("Failed to load canvas state:", error);
      });

      initialized.current = true;
    }
  }, [canvas, autoZoom, initialState, canvasHistory, setHistoryIndex]);
};
