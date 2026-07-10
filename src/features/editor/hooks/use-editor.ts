/**
 * @file Core editor engine for the Fabric.js-based design editor.
 *
 * Exposes `useEditor`, a hook that wires together canvas state,
 * history, clipboard, hotkeys, auto-resize and auto-zoom behavior,
 * and produces a stable `Editor` API (via `buildEditor`) that UI
 * components use to manipulate the canvas (add shapes/text/images,
 * change styling, export, undo/redo, zoom, etc.).
 */

import { useCallback, useMemo, useRef, useState } from "react";

import * as fabric from "fabric";
import { FabricObject } from "fabric";

import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { useClipboard } from "@/features/editor/hooks/use-clipboard";
import { useHistory } from "@/features/editor/hooks/use-history";
import { useHotkeys } from "@/features/editor/hooks/use-hotkeys";
import { useLoadState } from "@/features/editor/hooks/use-load-state";
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

/**
 * Builds the `Editor` API surface consumed by the UI.
 *
 * This is a pure factory: given the current canvas + related state
 * (colors, widths, selection, history callbacks, etc.), it returns a
 * fresh object exposing every editor action. It is re-created whenever
 * its dependencies change (see the `useMemo` in `useEditor`).
 */
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
  /**
   * Static options shared by the raster export formats (PNG/JPG).
   * Positional/size fields (`left`, `top`, `width`, `height`) are
   * intentionally omitted here since callers always derive and
   * override them from the un-zoomed workspace bounds at export time.
   */
  const generateSaveOptions = () => ({
    name: "Image",
    format: "png" as const,
    quality: 1,
    multiplier: 1,
  });

  /**
   * Runs `callback` with the canvas temporarily reset to an un-zoomed,
   * clip-path-free viewport so exports use the workspace's true pixel
   * coordinates, then restores the original clipPath and re-applies
   * `autoZoom()` afterwards — regardless of success or failure.
   *
   * Also handles the left/top vs. center-origin quirk: `getBoundingRect()`
   * is used (rather than `workspace.left/top`) because the workspace has
   * `originX/Y: "center"`, while the export APIs expect top-left coordinates.
   */
  const withExportViewport = <T>(
    callback: (bounds: {
      left: number;
      top: number;
      width: number;
      height: number;
    }) => T,
  ): T => {
    const originalClipPath = canvas.clipPath;
    canvas.clipPath = undefined;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    const workspace = getWorkspace() as fabric.Rect;
    const { left, top, width, height } = workspace.getBoundingRect();

    try {
      return callback({ left, top, width, height });
    } finally {
      canvas.clipPath = originalClipPath;
      autoZoom();
    }
  };

  /** Exports the current workspace as a PNG and triggers a download. */
  const savePng = () => {
    withExportViewport(({ left, top, width, height }) => {
      const dataUrl = canvas.toDataURL({
        ...generateSaveOptions(),
        left,
        top,
        width,
        height,
      });

      downloadFile(dataUrl, "png", "export");
    });
  };

  /**
   * Exports the current workspace as a real SVG document (via Fabric's
   * native `toSVG()`), rather than a raster dataURL mislabelled as `.svg`.
   */
  const saveSvg = () => {
    withExportViewport(({ left, top, width, height }) => {
      const svgString = canvas.toSVG({
        viewBox: { x: left, y: top, width, height },
        width: `${width}`,
        height: `${height}`,
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      downloadFile(url, "svg", "export");
      URL.revokeObjectURL(url);
    });
  };

  /** Exports the current workspace as a JPG and triggers a download. */
  const saveJpg = () => {
    withExportViewport(({ left, top, width, height }) => {
      const dataUrl = canvas.toDataURL({
        ...generateSaveOptions(),
        format: "jpeg",
        left,
        top,
        width,
        height,
      });

      downloadFile(dataUrl, "jpg", "export");
    });
  };

  /** Serializes the canvas to JSON and triggers a download. */
  const saveJson = async () => {
    const dataUrl = canvas.toObject(JSON_KEYS);

    transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t"),
    )}`;
    downloadFile(fileString, "json", "export");
  };

  /** Parses a JSON string and loads it onto the canvas, then re-fits the zoom. */
  const loadJson = (json: string) => {
    try {
      const data = JSON.parse(json);

      canvas
        .loadFromJSON(data)
        .then(() => {
          autoZoom();
        })
        .catch((error) => {
          console.error("Failed to load JSON onto canvas:", error);
        });
    } catch (error) {
      console.error("Failed to parse template JSON:", error);
    }
  };

  /** Returns the special "clip" rect object representing the design workspace/canvas bounds. */
  const getWorkspace = () => {
    return canvas
      .getObjects()
      .find(
        (object) =>
          (object as fabric.FabricObject & { name?: string }).name === "clip",
      );
  };

  /** Centers `object` within the workspace, if a workspace exists. */
  const center = (object: FabricObject) => {
    const workspace = getWorkspace();
    if (!workspace) return;

    const centerPoint = workspace.getCenterPoint();
    canvas._centerObject(object, centerPoint);
  };

  /** Centers, adds, and selects `object` on the canvas. */
  const addToCanvas = (object: FabricObject) => {
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  /**
   * Reads a property off the first selected object, falling back to the
   * provided default when nothing is selected or the property is unset.
   * Backs the various `getActiveXxx` accessors below.
   */
  const getActiveProp = <T>(key: string, fallback: T): T => {
    const selectedObject = selectedObjects[0];
    if (!selectedObject) return fallback;

    return (selectedObject.get(key) as T) ?? fallback;
  };

  /** Applies `props` to every currently selected object and re-renders. */
  const applyToActiveObjects = (props: Record<string, unknown>) => {
    canvas.getActiveObjects().forEach((object) => {
      object.set(props);
    });
    canvas.renderAll();
  };

  /** Applies `props` to selected objects that are text-type only, then re-renders. */
  const applyToActiveTextObjects = (props: Record<string, unknown>) => {
    canvas.getActiveObjects().forEach((object) => {
      if (isTextType(object.type)) {
        object.set(props);
      }
    });
    canvas.renderAll();
  };

  /** Keeps the workspace rect pinned behind all other objects. */
  const sendWorkspaceToBack = () => {
    const workspace = getWorkspace();
    if (workspace) {
      canvas.sendObjectToBack(workspace);
    }
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
    /** Loads an image from `url`, scales it to fit the workspace, and adds it. */
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
    /** Brings selected objects one step forward, keeping the workspace pinned to the back. */
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        // Used to be canvas.bringForward(object)
        canvas.bringObjectForward(object);
      });

      canvas.renderAll();
      sendWorkspaceToBack();
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
      applyToActiveObjects({ fill: color });
    },
    changeFontFamily: (fontFamily: string) => {
      setFontFamily(fontFamily);
      applyToActiveTextObjects({ fontFamily });
    },
    changeFontLinethrough: (value: boolean) => {
      applyToActiveTextObjects({ linethrough: value });
    },
    changeFontSize: (size: number) => {
      applyToActiveTextObjects({ fontSize: size });
    },
    changeFontStyle: (style: string) => {
      applyToActiveTextObjects({ fontStyle: style });
    },
    changeFontUnderline: (value: boolean) => {
      applyToActiveTextObjects({ underline: value });
    },
    changeFontWeight: (weight: number) => {
      applyToActiveTextObjects({ fontWeight: weight });
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
      applyToActiveObjects({ opacity });
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
      applyToActiveObjects({ strokeDashArray: value });
    },
    changeStrokeWidth: (width: number) => {
      setStrokeWidth(width);
      applyToActiveObjects({ strokeWidth: width });
    },
    changeTextAlign: (align: fabric.TextProps["textAlign"]) => {
      applyToActiveTextObjects({ textAlign: align });
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
    getActiveFillColor: () => getActiveProp("fill", fillColor),
    getActiveFontFamily: () => getActiveProp("fontFamily", fontFamily),
    getActiveFontLinethrough: () => getActiveProp("linethrough", false),
    getActiveFontSize: () => getActiveProp("fontSize", FONT_SIZE),
    getActiveFontStyle: () => getActiveProp("fontStyle", "normal"),
    getActiveFontUnderline: () => getActiveProp("underline", false),
    getActiveFontWeight: () => getActiveProp("fontWeight", FONT_WEIGHT),
    getActiveOpacity: () => getActiveProp("opacity", 1),
    getActiveStrokeColor: () => getActiveProp("stroke", strokeColor),
    getActiveStrokeDashArray: () =>
      getActiveProp("strokeDashArray", strokeDashArray),
    getActiveStrokeWidth: () => getActiveProp("strokeWidth", strokeWidth),
    getActiveTextAlign: () => getActiveProp("textAlign", "left"),
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
    /** Sends selected objects one step backward, keeping the workspace pinned to the back. */
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        // Used to be canvas.sendBackwards(object);
        canvas.sendObjectBackwards(object);
      });

      canvas.renderAll();
      sendWorkspaceToBack();
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

/**
 * Primary hook powering the editor.
 *
 * Owns canvas/UI state (selected objects, current draw/fill/stroke
 * settings), wires up history, clipboard, hotkeys, window events,
 * auto-resize/zoom and initial-state loading, and produces a memoized
 * `Editor` instance (via `buildEditor`) plus an `init` callback used to
 * bootstrap the Fabric canvas once the DOM container is available.
 *
 * @param props.clearSelectionCallback - Invoked when the selection is cleared.
 * @param props.defaultHeight - Initial workspace height, in px.
 * @param props.defaultWidth - Initial workspace width, in px.
 * @param props.defaultState - Optional serialized canvas state to seed history with.
 * @param props.saveCallback - Invoked by the history hook whenever a save/checkpoint occurs.
 * @returns `{ init, editor }` — call `init` once the canvas + container refs are ready;
 *          `editor` is `undefined` until then.
 */
export const useEditor = ({
  clearSelectionCallback,
  defaultHeight,
  defaultState,
  defaultWidth,
  saveCallback,
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

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
    saveCallback,
  });

  useWindowEvents(canUndo);

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

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory: canvasHistoryRef,
    setHistoryIndex,
  });

  // Rebuilt whenever the canvas or any editor-relevant state changes,
  // so consumers always call actions bound to the freshest values.
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

  /**
   * Bootstraps the Fabric canvas: applies default control styling,
   * creates and centers the "clip" workspace rect (used as the visible
   * page/canvas bounds and export clip region), sizes the canvas to
   * its container, and seeds the undo/redo history with the initial state.
   */
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
        width: initialWidth.current,
        height: initialHeight.current,
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
