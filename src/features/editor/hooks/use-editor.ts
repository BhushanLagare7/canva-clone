import { useCallback, useMemo, useState } from "react";

import * as fabric from "fabric";
import { FabricObject } from "fabric";

import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { useClipboard } from "@/features/editor/hooks/use-clipboard";
import { useHistory } from "@/features/editor/hooks/use-history";
import { useHotkeys } from "@/features/editor/hooks/use-hotkeys";
import { useWindowEvents } from "@/features/editor/hooks/use-window-events";
import {
  BuildEditorProps,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  Editor,
  EditorHookProps,
  FILL_COLOR,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  JSON_KEYS,
  RECTANGLE_OPTIONS,
  STROKE_COLOR,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
  TEXT_OPTIONS,
  TRIANGLE_OPTIONS,
} from "@/features/editor/types";
import {
  createFilter,
  downloadFile,
  isTextType,
  transformText,
} from "@/features/editor/utils";

const buildEditor = ({
  autoZoom,
  canRedo,
  canUndo,
  canvas,
  copy,
  drawColor,
  drawWidth,
  fillColor,
  fontFamily,
  paste,
  redo,
  save,
  selectedObjects,
  setDrawColor,
  setDrawWidth,
  setFillColor,
  setFontFamily,
  setStrokeColor,
  setStrokeDashArray,
  setStrokeWidth,
  strokeColor,
  strokeDashArray,
  strokeWidth,
  undo,
}: BuildEditorProps): Editor => {
  const generateSaveOptions = () => {
    const workspace = getWorkspace() as fabric.Rect;
    const { left, top, width, height } = workspace.getBoundingRect();

    return {
      name: "Image",
      format: "png" as const,
      quality: 1,
      width,
      height,
      left,
      top,
      multiplier: 1,
    };
  };

  const savePng = () => {
    const options = generateSaveOptions();

    // Temporarily remove clipPath — it was configured for the zoomed
    // editor viewport and distorts the export crop coordinates.
    const originalClipPath = canvas.clipPath;
    canvas.clipPath = undefined;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    // Use getBoundingRect() to get the actual top-left corner.
    // workspace.left/top are the CENTER point (originX/Y: "center"),
    // but toDataURL expects top-left corner coordinates.
    const workspace = getWorkspace() as fabric.Rect;
    const { left, top, width, height } = workspace.getBoundingRect();
    const dataUrl = canvas.toDataURL({
      ...options,
      left,
      top,
      width,
      height,
    });

    canvas.clipPath = originalClipPath;
    downloadFile(dataUrl, "png");
    autoZoom();
  };

  const saveSvg = () => {
    // Use fabric's native toSVG() to produce a real SVG document
    // instead of a raster dataURL mislabelled as ".svg".
    const originalClipPath = canvas.clipPath;
    canvas.clipPath = undefined;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const workspace = getWorkspace() as fabric.Rect;
    const { left, top, width, height } = workspace.getBoundingRect();

    const svgString = canvas.toSVG({
      viewBox: {
        x: left,
        y: top,
        width,
        height,
      },
      width: `${width}`,
      height: `${height}`,
    });

    canvas.clipPath = originalClipPath;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    downloadFile(url, "svg");
    URL.revokeObjectURL(url);
    autoZoom();
  };

  const saveJpg = () => {
    const options = generateSaveOptions();

    const originalClipPath = canvas.clipPath;
    canvas.clipPath = undefined;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const workspace = getWorkspace() as fabric.Rect;
    const { left, top, width, height } = workspace.getBoundingRect();
    const dataUrl = canvas.toDataURL({
      ...options,
      format: "jpeg",
      left,
      top,
      width,
      height,
    });

    canvas.clipPath = originalClipPath;
    downloadFile(dataUrl, "jpg");
    autoZoom();
  };

  const saveJson = async () => {
    const dataUrl = canvas.toObject(JSON_KEYS);

    transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t"),
    )}`;
    downloadFile(fileString, "json");
  };

  const loadJson = (json: string) => {
    const data = JSON.parse(json);

    canvas.loadFromJSON(data, () => {
      autoZoom();
    });
  };

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
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(circle);
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
          strokeDashArray: strokeDashArray,
        },
      );

      addToCanvas(diamond);
    },
    addImage: (url: string) => {
      fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" })
        .then((image) => {
          const workspace = getWorkspace();

          if (!workspace?.width || !workspace?.height) {
            console.warn("[addImage] No workspace found, skipping image add");
            return;
          }

          const scaleX = workspace.width / (image.width ?? 1);
          const scaleY = workspace.height / (image.height ?? 1);
          const scale = Math.min(scaleX, scaleY);
          image.scale(scale);

          addToCanvas(image);
        })
        .catch((err) => {
          console.error("[addImage] Failed to load image:", err);
        });
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
          strokeDashArray: strokeDashArray,
        },
      );

      addToCanvas(triangle);
    },
    addRectangle: () => {
      const rect = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(rect);
    },
    addSoftRectangle: () => {
      const rect = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(rect);
    },
    addText: (text: string, options?: Partial<fabric.TextboxProps>) => {
      const object = new fabric.Textbox(text, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        fontFamily,
        ...options,
      });
      addToCanvas(object);
    },
    addTriangle: () => {
      const triangle = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(triangle);
    },
    autoZoom,
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        // Used to be canvas.bringForward(object)
        canvas.bringObjectForward(object);
      });

      canvas.renderAll();

      const workspace = getWorkspace();
      if (workspace) {
        canvas.sendObjectToBack(workspace);
      }
      canvas.renderAll();
    },
    canRedo,
    canUndo,
    canvas,
    changeBackground: (color: string) => {
      const workspace = getWorkspace();
      workspace?.set({ fill: color });
      canvas.renderAll();
      save();
    },
    changeDrawColor: (color: string) => {
      setDrawColor(color);
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color;
      }
    },
    changeDrawWidth: (width: number) => {
      setDrawWidth(width);
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = width;
      }
    },
    changeFillColor: (color: string) => {
      setFillColor(color);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: color });
      });
      canvas.renderAll();
    },
    changeFontFamily: (fontFamily: string) => {
      setFontFamily(fontFamily);
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ fontFamily });
        }
      });
      canvas.renderAll();
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    changeFontSize: (size: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ fontSize: size });
        }
      });
      canvas.renderAll();
    },
    changeFontStyle: (style: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ fontStyle: style });
        }
      });
      canvas.renderAll();
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    changeFontWeight: (weight: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ fontWeight: weight });
        }
      });
      canvas.renderAll();
    },
    changeImageFilter: (filter: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.FabricImage;

          const effect = createFilter(filter);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
        }
      });
      canvas.renderAll();
    },
    changeOpacity: (opacity: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity });
      });
      canvas.renderAll();
    },
    changeSize: (size: { width: number; height: number }) => {
      const workspace = getWorkspace();

      workspace?.set(size);
      autoZoom();
      save();
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
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
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
    changeTextAlign: (align: fabric.TextProps["textAlign"]) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ textAlign: align });
        }
      });
      canvas.renderAll();
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.remove(object);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.width = drawWidth;
      canvas.freeDrawingBrush.color = drawColor;
    },
    getActiveDrawColor: () => drawColor,
    getActiveDrawWidth: () => drawWidth,
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) return fillColor;

      const value = selectedObject.get("fill") ?? fillColor;

      // Currently, gradient & pattern values are not supported
      return value as string;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return fontFamily;

      const value = selectedObject.get("fontFamily") ?? fontFamily;

      return value;
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return false;

      const value = selectedObject.get("linethrough") ?? false;

      return value;
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return FONT_SIZE;

      const value = selectedObject.get("fontSize") ?? FONT_SIZE;

      return value;
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return "normal";

      const value = selectedObject.get("fontStyle") ?? "normal";

      return value;
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return false;

      const value = selectedObject.get("underline") ?? false;

      return value;
    },
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return FONT_WEIGHT;

      const value = selectedObject.get("fontWeight") ?? FONT_WEIGHT;

      return value;
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return 1;

      const value = selectedObject.get("opacity") ?? 1;

      return value;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) return strokeColor;

      const value = selectedObject.get("stroke") ?? strokeColor;

      return value;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value = selectedObject.get("strokeDashArray") ?? strokeDashArray;

      return value;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value = selectedObject.get("strokeWidth") ?? strokeWidth;

      return value;
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) {
        return "left";
      }

      const value = selectedObject.get("textAlign") ?? "left";

      return value;
    },
    getWorkspace,
    loadJson,
    onCopy: () => copy(),
    onPaste: () => paste(),
    onRedo: () => redo(),
    onUndo: () => undo(),
    saveJpg,
    saveJson,
    savePng,
    saveSvg,
    selectedObjects,
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        // Used to be canvas.sendBackwards(object);
        canvas.sendObjectBackwards(object);
      });

      canvas.renderAll();

      const workspace = getWorkspace();
      if (workspace) {
        canvas.sendObjectToBack(workspace);
      }
      canvas.renderAll();
    },
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.05;
      const center = canvas.getCenterPoint();
      canvas.zoomToPoint(center, zoomRatio > 1 ? 1 : zoomRatio);
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.05;
      const center = canvas.getCenterPoint();
      canvas.zoomToPoint(center, zoomRatio < 0.2 ? 0.2 : zoomRatio);
    },
  };
};

export const useEditor = ({ clearSelectionCallback }: EditorHookProps) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [drawColor, setDrawColor] = useState<string>(STROKE_COLOR);
  const [drawWidth, setDrawWidth] = useState<number>(STROKE_WIDTH);
  const [fillColor, setFillColor] = useState<string>(FILL_COLOR);
  const [fontFamily, setFontFamily] = useState<string>(FONT_FAMILY);
  const [strokeColor, setStrokeColor] = useState<string>(STROKE_COLOR);
  const [strokeDashArray, setStrokeDashArray] =
    useState<number[]>(STROKE_DASH_ARRAY);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTH);

  useWindowEvents();

  const {
    canRedo,
    canUndo,
    canvasHistoryRef,
    save,
    setHistoryIndex,
    redo,
    undo,
  } = useHistory({
    canvas,
  });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    canvas,
    save,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    canvas,
    copy,
    paste,
    save,
    redo,
    undo,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        autoZoom,
        canRedo,
        canUndo,
        canvas,
        copy,
        drawColor,
        drawWidth,
        fillColor,
        fontFamily,
        paste,
        redo,
        save,
        selectedObjects,
        setDrawColor,
        setDrawWidth,
        setFillColor,
        setFontFamily,
        setStrokeColor,
        setStrokeDashArray,
        setStrokeWidth,
        strokeColor,
        strokeDashArray,
        strokeWidth,
        undo,
      });
    }

    return undefined;
  }, [
    autoZoom,
    canRedo,
    canUndo,
    canvas,
    copy,
    drawColor,
    drawWidth,
    fillColor,
    fontFamily,
    paste,
    redo,
    save,
    selectedObjects,
    strokeColor,
    strokeDashArray,
    strokeWidth,
    undo,
  ]);

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

      const currentState = JSON.stringify(initialCanvas.toObject(JSON_KEYS));
      canvasHistoryRef.current = [currentState];
      setHistoryIndex(0);
    },
    [
      canvasHistoryRef, // No need, this is from useRef
      setHistoryIndex, // No need, this is from useState
    ],
  );

  return {
    init,
    editor,
  };
};
