"use client";

import { type ComponentType, useCallback, useMemo } from "react";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { CiFileOn } from "react-icons/ci";

import { useMutationState } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  DownloadIcon,
  LoaderIcon,
  MousePointerClickIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import { useFilePicker } from "use-file-picker";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { UserButton } from "@/features/auth/components/user-button";
import { Logo } from "@/features/editor/components/logo";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

/**
 * Props accepted by the {@link Navbar} component.
 */
interface NavbarProps {
  /** Identifier of the project the navbar belongs to. Used to look up its save mutation status. */
  id: string;
  /** Currently active editor tool; used to visually highlight the active action. */
  activeTool: ActiveTool;
  /** Editor instance exposing undo/redo/export/import operations. May be `undefined` while initializing. */
  editor: Editor | undefined;
  /** Callback invoked whenever the user selects a different tool. */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

/** Shape shared by icon components from both `lucide-react` and `react-icons`. */
type IconComponent = ComponentType<{ className?: string }>;

/** Configuration describing a single toolbar icon button (Select / Undo / Redo). */
interface ToolbarButtonConfig {
  label: string;
  icon: IconComponent;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** Configuration describing a single entry in the "Export" dropdown menu. */
interface ExportOptionConfig {
  format: string;
  description: string;
  onClick: () => void;
}

/**
 * Top navigation bar for the editor page.
 *
 * Responsible for:
 * - Opening a previously saved `.json` project file.
 * - Switching between editor tools (select / undo / redo).
 * - Displaying the current save status of the project (saving / saved / failed).
 * - Exporting the current design as JSON, PNG, JPG or SVG.
 * - Rendering the logged-in user's account menu.
 */
export const Navbar = ({
  id,
  activeTool,
  editor,
  onChangeActiveTool,
}: NavbarProps) => {
  // Track the most recent "project save" mutation status for this project id.
  const mutationStatuses = useMutationState({
    filters: {
      mutationKey: ["project", { id }],
      exact: true,
    },
    select: (mutation) => mutation.state.status,
  });

  const currentStatus = mutationStatuses[mutationStatuses.length - 1];
  const isError = currentStatus === "error";
  const isPending = currentStatus === "pending";

  /**
   * Reads the selected `.json` file and loads it into the editor.
   * Read failures and JSON-parsing failures are reported separately,
   * matching the original behavior.
   */
  const handleFileSelected = useCallback(
    async ({ plainFiles }: { plainFiles: File[] }) => {
      if (!plainFiles || plainFiles.length === 0) return;

      const [file] = plainFiles;
      let fileContent: string;

      try {
        fileContent = await file.text();
      } catch (error) {
        console.error("Failed to read file", error);
        alert("Failed to read file");
        return;
      }

      try {
        await editor?.loadJson(fileContent);
      } catch (error) {
        console.error("Failed to parse JSON file", error);
        alert("Failed to parse JSON file");
      }
    },
    [editor],
  );

  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: handleFileSelected,
  });

  // Select / Undo / Redo toolbar actions, memoized to avoid recreation on every render.
  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        label: "Select",
        icon: MousePointerClickIcon,
        isActive: activeTool === "select",
        onClick: () => onChangeActiveTool("select"),
      },
      {
        label: "Undo",
        icon: Undo2Icon,
        disabled: !editor?.canUndo(),
        onClick: () => editor?.onUndo(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        disabled: !editor?.canRedo(),
        onClick: () => editor?.onRedo(),
      },
    ],
    [activeTool, editor, onChangeActiveTool],
  );

  // Available export formats, memoized to avoid recreation on every render.
  const exportOptions: ExportOptionConfig[] = useMemo(
    () => [
      {
        format: "JSON",
        description: "Save for later editing",
        onClick: () => editor?.saveJson(),
      },
      {
        format: "PNG",
        description: "Best for sharing on the web",
        onClick: () => editor?.savePng(),
      },
      {
        format: "JPG",
        description: "Best for printing",
        onClick: () => editor?.saveJpg(),
      },
      {
        format: "SVG",
        description: "Best for editing in vector software",
        onClick: () => editor?.saveSvg(),
      },
    ],
    [editor],
  );

  return (
    <nav className="flex h-17 w-full items-center gap-x-8 border-b p-4 lg:pl-8.5">
      <Logo />
      <div className="flex size-full items-center gap-x-1">
        {/* File menu */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              File
              <ChevronDownIcon className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-60">
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={() => openFilePicker()}
            >
              <CiFileOn className="size-8" />
              <div>
                <p>Open</p>
                <p className="text-muted-foreground text-xs">
                  Open a JSON file
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator className="mx-2" orientation="vertical" />

        {/* Select / Undo / Redo actions */}
        {toolbarButtons.map(
          ({ label, icon: Icon, isActive, disabled, onClick }) => (
            <Hint key={label} label={label} side="bottom" sideOffset={10}>
              <Button
                aria-label={label}
                className={cn(isActive && "bg-gray-100")}
                disabled={disabled}
                size="icon"
                variant="ghost"
                onClick={onClick}
              >
                <Icon className="size-4" />
              </Button>
            </Hint>
          ),
        )}

        <Separator className="mx-2" orientation="vertical" />

        {/* Save status */}
        <SaveStatusIndicator isError={isError} isPending={isPending} />

        <div className="ml-auto flex items-center gap-x-4">
          {/* Export menu */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                Export
                <DownloadIcon className="ml-4 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              {exportOptions.map(({ format, description, onClick }) => (
                <DropdownMenuItem
                  key={format}
                  className="flex items-center gap-x-2"
                  onClick={onClick}
                >
                  <CiFileOn className="size-8" />
                  <div>
                    <p>{format}</p>
                    <p className="text-muted-foreground text-xs">
                      {description}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

/**
 * Displays the current persistence status of the project:
 * - **Pending** – a save request is currently in flight.
 * - **Error** – the most recent save request failed.
 * - **Saved** – the most recent save request succeeded (default state).
 */
function SaveStatusIndicator({
  isPending,
  isError,
}: {
  isPending: boolean;
  isError: boolean;
}) {
  if (isPending) {
    return (
      <div className="flex items-center gap-x-2">
        <LoaderIcon className="text-muted-foreground size-4 animate-spin" />
        <div className="text-muted-foreground text-xs">Saving...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-x-2">
        <BsCloudSlash className="text-muted-foreground size-5" />
        <div className="text-muted-foreground text-xs">Failed to save</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2">
      <BsCloudCheck className="text-muted-foreground size-5" />
      <div className="text-muted-foreground text-xs">Saved</div>
    </div>
  );
}
