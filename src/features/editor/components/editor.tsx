"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Canvas } from "fabric";
import debounce from "lodash.debounce";

import { AiSidebar } from "@/features/editor/components/ai-sidebar";
import { DrawSidebar } from "@/features/editor/components/draw-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { Footer } from "@/features/editor/components/footer";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { Navbar } from "@/features/editor/components/navbar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { RemoveBgSidebar } from "@/features/editor/components/remove-bg-sidebar";
import { SettingsSidebar } from "@/features/editor/components/settings-sidebar";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { Sidebar } from "@/features/editor/components/sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { TemplateSidebar } from "@/features/editor/components/template-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { ActiveTool, selectionDependentTools } from "@/features/editor/types";
import { ResponseType } from "@/features/projects/api/use-get-project";
import { useUpdateProject } from "@/features/projects/api/use-update-project";

interface EditorProps {
  /** Initial project data (canvas JSON, dimensions, id, etc.) used to hydrate the editor on mount. */
  initialData: ResponseType["data"];
}

/**
 * `Editor` is the main design-editor screen.
 *
 * It wires together:
 * - A Fabric.js `Canvas` instance (created once on mount and disposed on unmount).
 * - The `useEditor` hook, which exposes an `editor` API used by the toolbar/sidebars/footer.
 * - A debounced auto-save mechanism that persists canvas state (`json`, `width`, `height`)
 *   to the backend whenever the editor reports a change.
 * - Tool-selection state (`activeTool`) that determines which contextual sidebar is visible.
 *
 * @param props.initialData - The persisted project data used to initialize the canvas and editor.
 */
export const Editor = ({ initialData }: EditorProps) => {
  const { mutate } = useUpdateProject(initialData.id);

  /**
   * Debounced persistence of canvas state. Debouncing prevents excessive network
   * requests while the user is actively editing (e.g. dragging, typing, resizing).
   */
  const debouncedSave = useMemo(
    () =>
      debounce((values: { json: string; height: number; width: number }) => {
        mutate(values);
      }, 500),
    [mutate],
  );

  // Cancel any pending debounced save on unmount to avoid calling `mutate`
  // after the component has been removed from the tree.
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  /** Currently active tool, controlling which contextual sidebar/panel is shown. */
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  /**
   * Resets the active tool back to "select" whenever the current selection is cleared,
   * but only if the active tool actually depends on having a selection.
   */
  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    clearSelectionCallback: onClearSelection,
    saveCallback: debouncedSave,
  });

  /**
   * Handles switching between tools:
   * - Enables/disables Fabric's drawing mode as needed.
   * - Toggles back to "select" if the same tool is clicked twice.
   */
  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enableDrawingMode();
      }

      if (activeTool === "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, editor],
  );

  /**
   * Common props shared by every contextual sidebar that operates on the editor
   * instance. Memoized to avoid recreating the object on every render and to
   * keep each sidebar's JSX declaration concise.
   *
   * Note: the base `Sidebar` (tool switcher) intentionally does not use this
   * object, since it does not accept an `editor` prop.
   */
  const sidebarProps = useMemo(
    () => ({ activeTool, editor, onChangeActiveTool }),
    [activeTool, editor, onChangeActiveTool],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);

  /**
   * Creates the Fabric.js canvas on mount and initializes the editor with it.
   * The canvas is disposed on unmount to release WebGL/DOM resources.
   */
  useEffect(() => {
    if (!canvasRef.current || !container.current) return;

    const canvas = new Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: container.current,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        activeTool={activeTool}
        editor={editor}
        id={initialData.id}
        onChangeActiveTool={onChangeActiveTool}
      />
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        {/* Base tool switcher — does not operate on the editor instance directly. */}
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />

        {/* Contextual sidebars, shown/hidden based on `activeTool`. */}
        <ShapeSidebar {...sidebarProps} />
        <FillColorSidebar {...sidebarProps} />
        <StrokeColorSidebar {...sidebarProps} />
        <StrokeWidthSidebar {...sidebarProps} />
        <OpacitySidebar {...sidebarProps} />
        <TextSidebar {...sidebarProps} />
        <FontSidebar {...sidebarProps} />
        <ImageSidebar {...sidebarProps} />
        <FilterSidebar {...sidebarProps} />
        <AiSidebar {...sidebarProps} />
        <RemoveBgSidebar {...sidebarProps} />
        <DrawSidebar {...sidebarProps} />
        <SettingsSidebar {...sidebarProps} />
        <TemplateSidebar {...sidebarProps} />

        <main className="bg-muted relative flex flex-1 flex-col overflow-auto">
          <Toolbar
            activeTool={activeTool}
            editor={editor}
            onChangeActiveTool={onChangeActiveTool}
          />
          <div
            ref={container}
            className="bg-muted relative min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <canvas ref={canvasRef} />
          </div>
          <Footer editor={editor} />
        </main>
      </div>
    </div>
  );
};
