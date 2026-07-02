import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FontSizeInputProps {
  /** The current font size value. */
  value: number;
  /** Callback triggered when the font size changes. */
  onChange: (value: number) => void;
}

/**
 * FontSizeInput provides a numeric input with increment and decrement buttons
 * for adjusting the font size of a selected text element.
 */
export const FontSizeInput = ({ value, onChange }: FontSizeInputProps) => {
  /** Increases the font size by 1. */
  const increment = () => onChange(value + 1);

  /** Decreases the font size by 1. */
  const decrement = () => onChange(value - 1);

  /** Handles direct input changes, parsing the entered string to an integer. */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange(value);
  };

  return (
    <div className="flex items-center">
      {/* Decrement button */}
      <Button
        className="rounded-r-none border-r-0 p-2"
        size="icon"
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
        size="icon"
        variant="outline"
        onClick={increment}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  );
};
