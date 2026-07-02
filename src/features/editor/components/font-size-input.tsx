import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** The smallest font size that can be set via the input or buttons. */
const MIN_FONT_SIZE = 1;
/** The largest font size that can be set via the input or buttons. */
const MAX_FONT_SIZE = 1000;

interface FontSizeInputProps {
  /** The current font size value. */
  value: number;
  /** Callback triggered when the font size changes. */
  onChange: (value: number) => void;
}

/** Clamps a font size to the valid [MIN_FONT_SIZE, MAX_FONT_SIZE] range. */
const clampFontSize = (size: number) =>
  Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size));

/**
 * FontSizeInput provides a numeric input with increment and decrement buttons
 * for adjusting the font size of a selected text element.
 */
export const FontSizeInput = ({ value, onChange }: FontSizeInputProps) => {
  /** Increases the font size by 1, clamped to the valid range. */
  const increment = () => onChange(clampFontSize(value + 1));

  /** Decreases the font size by 1, clamped to the valid range. */
  const decrement = () => onChange(clampFontSize(value - 1));

  /**
   * Handles direct input changes, parsing the entered string to an integer
   * and ignoring empty/non-numeric input so NaN never reaches the editor.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (Number.isNaN(parsed)) return;
    onChange(clampFontSize(parsed));
  };

  return (
    <div className="flex items-center">
      {/* Decrement button */}
      <Button
        className="rounded-r-none border-r-0 p-2"
        size="icon-sm"
        variant="outline"
        onClick={decrement}
      >
        <MinusIcon className="size-4" />
      </Button>

      {/* Direct font size input */}
      <Input
        className="h-8 w-12.5 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
        value={value}
        onChange={handleChange}
      />

      {/* Increment button */}
      <Button
        className="rounded-l-none border-l-0 p-2"
        size="icon-sm"
        variant="outline"
        onClick={increment}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  );
};
