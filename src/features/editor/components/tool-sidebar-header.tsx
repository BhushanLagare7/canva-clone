/** Props for the ToolSidebarHeader component */
interface ToolSidebarHeaderProps {
  /** The main title displayed in the sidebar header */
  title: string;
  /** Optional description text displayed below the title */
  description?: string;
}

/**
 * A header component for the tool sidebar, displaying a title and an optional description.
 */
export const ToolSidebarHeader = ({
  title,
  description,
}: ToolSidebarHeaderProps) => {
  return (
    <div className="h-17 space-y-1 border-b p-4">
      <p className="text-sm font-medium">{title}</p>
      {/* Render description only if provided */}
      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
    </div>
  );
};
