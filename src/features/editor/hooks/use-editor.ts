import { useCallback, useMemo, useState } from "react";

import * as fabric from "fabric";
import { FabricObject } from "fabric";

import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import {
  BuildEditorProps,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  Editor,
  FILL_COLOR,
  RECTANGLE_OPTIONS,
  STROKE_COLOR,
  STROKE_WIDTH,
  TRIANGLE_OPTIONS,
} from "@/features/editor/types";
import { isTextType } from "@/features/editor/utils";

const buildEditor = ({
  canvas,
  fillColor,
  selectedObjects,
  setFillColor,
  setStrokeColor,
  setStrokeWidth,
  strokeColor,
  strokeWidth,
}: BuildEditorProps): Editor => {
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
    changeFillColor: (color: string) => {
      setFillColor(color);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: color });
      });
      canvas.renderAll();
    },
    changeStrokeColor: (color: string) => {
      setStrokeColor(color);
      canvas.getActiveObjects().forEach((object) => {
        // Text objects should use fill color for stroke since, texts dont have stroke property
        if (isTextType(object.type)) {
          object.set({ fill: color });
          return;
        }
        object.set({ stroke: color });
      });
      canvas.renderAll();
    },
    changeStrokeWidth: (width: number) => {
      setStrokeWidth(width);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: width });
      });
      canvas.renderAll();
    },
    addCircle: () => {
      const circle = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });

      addToCanvas(circle);
    },
    addSoftRectangle: () => {
      const rect = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });

      addToCanvas(rect);
    },
    addRectangle: () => {
      const rect = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });

      addToCanvas(rect);
    },
    addTriangle: () => {
      const triangle = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
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
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        },
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
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        },
      );

      addToCanvas(diamond);
    },
    canvas,
    fillColor,
    strokeColor,
    strokeWidth,
    selectedObjects,
  };
};

export const useEditor = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fillColor, setFillColor] = useState<string>(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState<string>(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTH);

  useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    canvas,
    setSelectedObjects,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        canvas,
        fillColor,
        selectedObjects,
        setFillColor,
        setStrokeWidth,
        setStrokeColor,
        strokeColor,
        strokeWidth,
      });
    }

    return undefined;
  }, [canvas, fillColor, selectedObjects, strokeColor, strokeWidth]);

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
