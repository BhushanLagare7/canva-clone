import { useCallback, useMemo, useState } from "react";

import * as fabric from "fabric";
import { FabricObject } from "fabric";

import {
  BuildEditorProps,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  Editor,
  RECTANGLE_OPTIONS,
  TRIANGLE_OPTIONS,
} from "@/features/editor/types";

import { useAutoResize } from "./use-auto-resize";

const buildEditor = ({ canvas }: BuildEditorProps): Editor => {
  const getWorkspace = () => {
    return canvas
      .getObjects()
      .find(
        (object) =>
          (object as fabric.FabricObject & { name?: string }).name === "clip",
      );
  };

  const center = (object: FabricObject) => {
    const workspace = getWorkspace();
    if (!workspace) return;

    const center = workspace.getCenterPoint();
    canvas._centerObject(object, center);
  };

  const addToCanvas = (object: FabricObject) => {
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  return {
    addCircle: () => {
      const circle = new fabric.Circle({
        ...CIRCLE_OPTIONS,
      });

      addToCanvas(circle);
    },
    addSoftRectangle: () => {
      const rect = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
      });

      addToCanvas(rect);
    },
    addRectangle: () => {
      const rect = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
      });

      addToCanvas(rect);
    },
    addTriangle: () => {
      const triangle = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
      });

      addToCanvas(triangle);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;
      const triangle = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        { ...TRIANGLE_OPTIONS },
      );

      addToCanvas(triangle);
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;
      const diamond = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        { ...DIAMOND_OPTIONS },
      );

      addToCanvas(diamond);
    },
  };
};

export const useEditor = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useAutoResize({
    canvas,
    container,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        canvas,
      });
    }

    return undefined;
  }, [canvas]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
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
      const initialWorkspace = new fabric.Rect({
        width: 900,
        height: 1200,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
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

      setCanvas(initialCanvas);
      setContainer(initialContainer);
    },
    [],
  );

  return {
    init,
    editor,
  };
};
