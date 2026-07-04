import { useCallback, useRef } from "react";

import * as fabric from "fabric";
import { ActiveSelection, FabricObject } from "fabric";

/** Props for the {@link useClipboard} hook. */
interface UseClipboardProps {
  /** The Fabric.js canvas instance. `null` when the canvas hasn't mounted yet. */
  canvas: fabric.Canvas | null;
}

/**
 * Provides copy/paste clipboard functionality for Fabric.js canvas objects.
 *
 * ## Flow
 * 1. **Copy** – clones the currently active canvas object and stores it in an
 *    internal ref (`clipboard`).
 * 2. **Paste** – clones the stored clipboard object, offsets it by 10px so the
 *    duplicate is visually distinguishable, adds it to the canvas, and makes it
 *    the new active selection.
 *
 * Both operations are **async** because Fabric.js v7's `clone()` returns a
 * `Promise`. Callers must `await` copy before paste to avoid pasting a stale
 * clipboard value.
 *
 * @example
 * ```ts
 * const { copy, paste } = useClipboard({ canvas });
 *
 * // Duplicate the selected object:
 * await copy();
 * await paste();
 * ```
 */
export const useClipboard = ({ canvas }: UseClipboardProps) => {
  /**
   * Holds the most recently copied Fabric object.
   * Persists across renders without causing re-renders (useRef).
   */
  const clipboard = useRef<FabricObject | null>(null);

  /**
   * Clones the currently active canvas object and stores it in the clipboard.
   *
   * Returns a `Promise` that resolves once the clone is stored. Callers
   * **must** await this before calling {@link paste} to ensure the clipboard
   * reflects the current selection.
   */
  const copy = useCallback(async () => {
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) return;

    const cloned = await activeObject.clone();
    clipboard.current = cloned;
  }, [canvas]);

  /**
   * Pastes the clipboard contents onto the canvas.
   *
   * Creates a fresh clone of the stored clipboard object (so the clipboard
   * itself remains reusable for repeated pastes), offsets it by 10px on both
   * axes, and adds it to the canvas.
   *
   * For multi-object selections ({@link ActiveSelection}), each child object
   * is individually added to the canvas and coordinates are recalculated.
   *
   * After pasting, the clipboard's own position is shifted by 10px so that
   * subsequent pastes continue to cascade visually.
   */
  const paste = useCallback(async () => {
    if (!clipboard.current) return;

    // Clone the clipboard (not the clipboard itself) so it stays reusable
    const clonedObj = await clipboard.current.clone();
    canvas?.discardActiveObject();
    clonedObj.set({
      left: (clonedObj.left ?? 0) + 10,
      top: (clonedObj.top ?? 0) + 10,
      evented: true,
    });

    if (clonedObj instanceof ActiveSelection) {
      // Multi-select: assign canvas and add each child individually
      clonedObj.canvas = canvas as fabric.Canvas;
      clonedObj.forEachObject((obj: FabricObject) => {
        canvas?.add(obj);
      });
      clonedObj.setCoords();
    } else {
      canvas?.add(clonedObj);
    }

    // Shift clipboard position so the next paste cascades further
    clipboard.current.top = (clipboard.current.top ?? 0) + 10;
    clipboard.current.left = (clipboard.current.left ?? 0) + 10;
    canvas?.setActiveObject(clonedObj);
    canvas?.requestRenderAll();
  }, [canvas]);

  return { copy, paste };
};

