/**
 * Server-safe color picker wrapper that dynamically imports the client-side
 * color picker component with SSR disabled to prevent hydration issues.
 */
import dynamic from "next/dynamic";

import type { ColorPickerProps } from "@/features/editor/components/color-picker-client";

/**
 * Dynamically imported color picker that renders a placeholder div
 * with matching dimensions while the component loads.
 */
const DynamicColorPicker = dynamic(
  () =>
    import("@/features/editor/components/color-picker-client").then(
      (module) => module.ColorPickerClient,
    ),
  {
    ssr: false,
    loading: () => <div className="min-h-109.5 w-full" />,
  },
);

/**
 * Public-facing color picker component.
 * Delegates rendering to the dynamically loaded client component.
 *
 * @param props - See {@link ColorPickerProps}
 */
export const ColorPicker = (props: ColorPickerProps) => {
  return <DynamicColorPicker {...props} />;
};
