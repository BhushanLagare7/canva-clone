import { ChevronsLeftIcon } from "lucide-react";

/** Props for the ToolSidebarClose component */
interface ToolSidebarCloseProps {
  /** Callback function triggered when the close button is clicked */
  onClick: () => void;
}

/**
 * A button that closes the tool sidebar, positioned on the right edge of the sidebar.
 */
export const ToolSidebarClose = ({ onClick }: ToolSidebarCloseProps) => {
  return (
    <button
      className="group absolute top-1/2 right-[-1.8rem] flex h-17.5 -translate-y-1/2 transform items-center justify-center rounded-r-xl border-y border-r bg-white px-1 pr-2"
      onClick={onClick}
    >
      {/* Left-pointing chevron icon to indicate closing/collapsing action */}
      <ChevronsLeftIcon className="size-4 text-black transition group-hover:opacity-75" />
    </button>
  );
};
