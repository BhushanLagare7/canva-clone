import * as fabric from "fabric";
import material from "material-colors";

export const selectionDependentTools = [
  "fill",
  "font",
  "filter",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
];

export const colors = [
  material.red["500"],
  material.pink["500"],
  material.purple["500"],
  material.deepPurple["500"],
  material.indigo["500"],
  material.blue["500"],
  material.lightBlue["500"],
  material.cyan["500"],
  material.teal["500"],
  material.green["500"],
  material.lightGreen["500"],
  material.lime["500"],
  material.yellow["500"],
  material.amber["500"],
  material.orange["500"],
  material.deepOrange["500"],
  material.brown["500"],
  material.blueGrey["500"],
  "transparent",
];

export type ActiveTool =
  | "select"
  | "shapes"
  | "text"
  | "images"
  | "draw"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings"
  | "ai"
  | "remove-bg"
  | "templates";

export const FILL_COLOR = "rgba(0, 0, 0, 1)";
export const STROKE_COLOR = "rgba(0, 0, 0, 1)";
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = [];

export const CIRCLE_OPTIONS = {
  radius: 225,
  top: 100,
  left: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
};

export const RECTANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 400,
  height: 400,
  angle: 0,
};

export const DIAMOND_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 600,
  height: 600,
  angle: 0,
};

export const TRIANGLE_OPTIONS = {
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  width: 400,
  height: 400,
  angle: 0,
};

export interface EditorHookProps {
  clearSelectionCallback?: () => void;
}

export type BuildEditorProps = {
  canvas: fabric.Canvas;
  fillColor: string;
  selectedObjects: fabric.Object[];
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeDashArray: (array: number[]) => void;
  setStrokeWidth: (width: number) => void;
  strokeColor: string;
  strokeDashArray: number[];
  strokeWidth: number;
};

export interface Editor {
  addCircle: () => void;
  addDiamond: () => void;
  addInverseTriangle: () => void;
  addRectangle: () => void;
  addSoftRectangle: () => void;
  addTriangle: () => void;
  bringForward: () => void;
  canvas: fabric.Canvas;
  changeFillColor: (color: string) => void;
  changeOpacity: (opacity: number) => void;
  changeStrokeColor: (color: string) => void;
  changeStrokeWidth: (width: number) => void;
  changeStrokeDashArray: (array: number[]) => void;
  getActiveFillColor: () => string;
  getActiveOpacity: () => number;
  getActiveStrokeColor: () => string;
  getActiveStrokeDashArray: () => number[];
  getActiveStrokeWidth: () => number;
  sendBackwards: () => void;
  selectedObjects: fabric.Object[];
}
