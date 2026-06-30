import { useCallback } from "react";

import { type Canvas, FabricObject, Rect, Shadow } from "fabric";

export const useEditor = () => {
  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      FabricObject.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3B82F6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3B82F6",
      });
      const initialWorkspace = new Rect({
        width: 900,
        height: 1200,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new Shadow({
          color: "rgba(0, 0, 0, 0.8)",
          blur: 5,
        }),
      });

      initialCanvas.setDimensions({
        width: initialContainer.offsetWidth,
        height: initialContainer.offsetHeight,
      });

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;
    },
    [],
  );

  return {
    init,
  };
};
