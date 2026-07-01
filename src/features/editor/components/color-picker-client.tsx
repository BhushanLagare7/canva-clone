"use client";

import { ChromePicker, CirclePicker } from "react-color";

import { colors } from "@/features/editor/types";
import { rgbaObjectToString } from "@/features/editor/utils";

export interface ColorPickerProps {
  /** The current color value in RGBA string format. */
  value: string;
  /** Callback fired when the user selects a new color. Receives an RGBA string. */
  onChange: (value: string) => void;
}

/**
 * Client-side color picker combining a ChromePicker (for fine-grained control)
 * and a CirclePicker (for quick preset color selection).
 *
 * Both pickers normalize the selected color to an RGBA string before
 * invoking the `onChange` callback.
 */
export const ColorPickerClient = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="w-full space-y-4">
      {/* Full-featured picker with hue, saturation, and opacity controls */}
      <ChromePicker
        className="rounded-lg border"
        color={value}
        onChange={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
      />
      {/* Quick-select preset color swatches */}
      <CirclePicker
        color={value}
        colors={colors}
        onChangeComplete={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
      />
    </div>
  );
};
