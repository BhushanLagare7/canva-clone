import * as fabric from "fabric";
import material from "material-colors";

export const fonts = [
  "Arial",
  "Arial Black",
  "Bookman",
  "Brush Script MT",
  "Comic Sans MS",
  "Courier New",
  "Garamond",
  "Geneva",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Palatino",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

export const selectionDependentTools = [
  "fill",
  "filter",
  "font",
  "opacity",
  "remove-bg",
  "stroke-color",
  "stroke-width",
];

export const colors = [
  material.amber["500"],
  material.blue["500"],
  material.blueGrey["500"],
  material.brown["500"],
  material.cyan["500"],
  material.deepOrange["500"],
  material.deepPurple["500"],
  material.green["500"],
  material.indigo["500"],
  material.lightBlue["500"],
  material.lightGreen["500"],
  material.lime["500"],
  material.orange["500"],
  material.pink["500"],
  material.purple["500"],
  material.red["500"],
  material.teal["500"],
  material.yellow["500"],
  "transparent",
];

export type ActiveTool =
  | "ai"
  | "draw"
  | "fill"
  | "filter"
  | "font"
  | "images"
  | "opacity"
  | "remove-bg"
  | "select"
  | "settings"
  | "shapes"
  | "stroke-color"
  | "stroke-width"
  | "templates"
  | "text";

export const FILL_COLOR = "rgba(0, 0, 0, 1)";
export const STROKE_COLOR = "rgba(0, 0, 0, 1)";
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = [];
export const FONT_FAMILY = "Arial";
export const FONT_SIZE = 32;
export const FONT_WEIGHT = 400;

export const CIRCLE_OPTIONS = {
  fill: FILL_COLOR,
  left: 100,
  radius: 225,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  top: 100,
};

export const RECTANGLE_OPTIONS = {
  angle: 0,
  fill: FILL_COLOR,
  height: 400,
  left: 100,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  top: 100,
  width: 400,
};

export const DIAMOND_OPTIONS = {
  angle: 0,
  fill: FILL_COLOR,
  height: 600,
  left: 100,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  top: 100,
  width: 600,
};

export const TRIANGLE_OPTIONS = {
  angle: 0,
  fill: FILL_COLOR,
  height: 400,
  left: 100,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  top: 100,
  width: 400,
};

export const TEXT_OPTIONS = {
  fontFamily: FONT_FAMILY,
  fontSize: FONT_SIZE,
  fill: FILL_COLOR,
  left: 100,
  top: 100,
};

export interface EditorHookProps {
  clearSelectionCallback?: () => void;
}

export type BuildEditorProps = {
  canvas: fabric.Canvas;
  fillColor: string;
  fontFamily: string;
  selectedObjects: fabric.Object[];
  setFillColor: (color: string) => void;
  setFontFamily: (fontFamily: string) => void;
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
  addText: (text: string, options?: Partial<fabric.TextboxProps>) => void;
  addTriangle: () => void;
  bringForward: () => void;
  canvas: fabric.Canvas;
  changeFillColor: (color: string) => void;
  changeFontFamily: (fontFamily: string) => void;
  changeFontLinethrough: (value: boolean) => void;
  changeFontSize: (size: number) => void;
  changeFontStyle: (style: string) => void;
  changeFontUnderline: (value: boolean) => void;
  changeFontWeight: (weight: number) => void;
  changeOpacity: (opacity: number) => void;
  changeStrokeColor: (color: string) => void;
  changeTextAlign: (align: fabric.TextProps["textAlign"]) => void;
  changeStrokeDashArray: (array: number[]) => void;
  changeStrokeWidth: (width: number) => void;
  getActiveFillColor: () => string;
  getActiveFontFamily: () => string;
  getActiveFontLinethrough: () => boolean;
  getActiveFontSize: () => number;
  getActiveFontStyle: () => string;
  getActiveFontUnderline: () => boolean;
  getActiveFontWeight: () => number;
  getActiveOpacity: () => number;
  getActiveStrokeColor: () => string;
  getActiveStrokeDashArray: () => number[];
  getActiveStrokeWidth: () => number;
  getActiveTextAlign: () => fabric.TextProps["textAlign"];
  selectedObjects: fabric.Object[];
  sendBackwards: () => void;
}
