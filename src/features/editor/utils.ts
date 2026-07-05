import type { RGBColor } from "react-color";

import * as fabric from "fabric";
import { v4 as uuid } from "uuid";

export interface SerializedObject {
  type: string;
  objects?: SerializedObject[];
}

export function transformText(objects: SerializedObject[] | undefined) {
  if (!objects) return;

  objects.forEach((item) => {
    if (item.objects) {
      transformText(item.objects);
    } else if (item.type === "text") {
      item.type = "textbox";
    }
  });
}

export function downloadFile(file: string, type: string, baseName?: string) {
  const anchorElement = document.createElement("a");

  anchorElement.href = file;
  anchorElement.download = baseName ? `${baseName}-${uuid()}.${type}` : `${uuid()}.${type}`;
  document.body.appendChild(anchorElement);
  anchorElement.click();
  anchorElement.remove();
}

/**
 * Checks if a given fabric object type is a text-based type.
 * @param type - The type string to check (e.g., "text", "i-text", "textbox").
 * @returns True if the type is a text-based type, false otherwise.
 */
export function isTextType(type: string | undefined) {
  return type === "text" || type === "i-text" || type === "textbox";
}

/**
 * Converts an RGBColor object (or "transparent") into a CSS rgba string.
 * @param rgba - An RGBColor object or the string "transparent".
 * @returns A CSS-compatible rgba string (e.g., "rgba(255, 0, 0, 1)").
 */
export function rgbaObjectToString(rgba: RGBColor | "transparent") {
  if (rgba === "transparent") {
    return `rgba(0,0,0,0)`;
  }

  const alpha = rgba.a === undefined ? 1 : rgba.a;

  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`;
}

/**
 * Creates a Fabric.js image filter instance based on the given filter name.
 * @param value - The name of the filter to create (e.g., "sepia", "blur", "contrast").
 * @returns A Fabric.js filter instance corresponding to the given value,
 *          or null/undefined if the value does not match any known filter.
 */
export const createFilter = (value: string) => {
  let effect;

  switch (value) {
    case "blacknwhite":
      effect = new fabric.filters.BlackWhite();
      break;
    case "blendcolor":
      effect = new fabric.filters.BlendColor({
        color: "#00ff00",
        mode: "multiply",
      });
      break;
    case "blur":
      effect = new fabric.filters.Blur();
      break;
    case "brightness":
      effect = new fabric.filters.Brightness({ brightness: 0.8 });
      break;
    case "brownie":
      effect = new fabric.filters.Brownie();
      break;
    case "contrast":
      effect = new fabric.filters.Contrast({ contrast: 0.3 });
      break;
    case "emboss":
      // Convolution matrix for embossing effect
      effect = new fabric.filters.Convolute({
        matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1],
      });
      break;
    case "gamma":
      effect = new fabric.filters.Gamma({
        gamma: [1, 0.5, 2.1],
      });
      break;
    case "greyscale":
      effect = new fabric.filters.Grayscale();
      break;
    case "huerotate":
      effect = new fabric.filters.HueRotation({
        rotation: 0.5,
      });
      break;
    case "invert":
      effect = new fabric.filters.Invert();
      break;
    case "kodachrome":
      effect = new fabric.filters.Kodachrome();
      break;
    case "pixelate":
      effect = new fabric.filters.Pixelate();
      break;
    case "polaroid":
      effect = new fabric.filters.Polaroid();
      break;
    case "resize":
      effect = new fabric.filters.Resize();
      break;
    case "saturation":
      effect = new fabric.filters.Saturation({
        saturation: 0.7,
      });
      break;
    case "sepia":
      effect = new fabric.filters.Sepia();
      break;
    case "sharpen":
      // Convolution matrix for sharpening effect
      effect = new fabric.filters.Convolute({
        matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      });
      break;
    case "technicolor":
      effect = new fabric.filters.Technicolor();
      break;
    case "vibrance":
      effect = new fabric.filters.Vibrance({
        vibrance: 1,
      });
      break;
    case "vintage":
      effect = new fabric.filters.Vintage();
      break;
    default:
      return null;
  }

  return effect;
};
