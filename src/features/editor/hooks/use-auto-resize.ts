import { useCallback, useEffect } from "react";

import * as fabric from "fabric";

interface UseAutoResizeProps {
  /** The Fabric.js canvas instance to resize */
  canvas: fabric.Canvas | null;
  /** The HTML container element that wraps the canvas */
  container: HTMLDivElement | null;
}

/**
 * Hook that automatically resizes and re-centers the Fabric.js canvas
 * whenever its container element changes size.
 */
export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
  /**
   * Adjusts the canvas dimensions, zoom level, and viewport transform
   * to fit the workspace object ("clip") within the container.
   */
  const autoZoom = useCallback(() => {
    if (!canvas || !container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Match canvas dimensions to container size
    canvas.setDimensions({ height, width });

    const center = canvas.getCenterPoint();

    const localWorkspace = canvas
      .getObjects()
      .find(
        (object) =>
          (object as fabric.FabricObject & { name?: string }).name === "clip",
      );

    // Nothing to zoom to — workspace hasn't been added yet
    if (!localWorkspace) return;

    const zoomRatio = 0.85; // Slight padding to avoid clipping at edges

    // Calculate the scale needed to fit the workspace within the canvas
    const scale = fabric.util.findScaleToFit(
      localWorkspace as fabric.FabricObject,
      { width, height },
    );

    const zoom = zoomRatio * scale;

    // Reset viewport and apply the calculated zoom
    canvas.setViewportTransform([...fabric.iMatrix] as fabric.TMat2D);
    canvas.zoomToPoint(center, zoom);

    // Re-center the viewport around the workspace object
    const workspaceCenter = localWorkspace.getCenterPoint();
    const viewportTransform = canvas.viewportTransform;

    if (
      canvas.width === undefined ||
      canvas.height === undefined ||
      !viewportTransform
    ) {
      return;
    }

    // Adjust the viewport transform to center the workspace on screen
    canvas.setViewportTransform([
      viewportTransform[0],
      viewportTransform[1],
      viewportTransform[2],
      viewportTransform[3],
      canvas.width / 2 - workspaceCenter.x * viewportTransform[0],
      canvas.height / 2 - workspaceCenter.y * viewportTransform[3],
    ]);

    // Apply the workspace as a clip path to restrict visible content
    localWorkspace.clone().then((cloned) => {
      canvas.clipPath = cloned;
      canvas.requestRenderAll();
    });
  }, [canvas, container]);

  /**
   * Observes the container for size changes and triggers autoZoom accordingly.
   * Cleans up the ResizeObserver when the component unmounts.
   */
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    if (canvas && container) {
      resizeObserver = new ResizeObserver(() => {
        autoZoom();
      });

      resizeObserver.observe(container);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [canvas, container, autoZoom]);

  return { autoZoom };
};
