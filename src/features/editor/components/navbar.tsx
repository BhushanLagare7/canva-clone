"use client";

import { BsCloudCheck } from "react-icons/bs";
import { CiFileOn } from "react-icons/ci";

import {
  ChevronDownIcon,
  DownloadIcon,
  MousePointerClickIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/features/editor/components/logo";
import { ActiveTool } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const Navbar = ({ activeTool, onChangeActiveTool }: NavbarProps) => {
  return (
    <nav className="flex h-17 w-full items-center gap-x-8 border-b p-4 lg:pl-8.5">
      <Logo />
      <div className="flex size-full items-center gap-x-1">
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
              onClick={() => {}} // TODO: Add functionality
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
        <Hint label="Select" side="bottom" sideOffset={10}>
          <Button
            aria-label="Select"
            className={cn(activeTool === "select" && "bg-gray-100")}
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("select")}
          >
            <MousePointerClickIcon className="size-4" />
          </Button>
        </Hint>
        <Hint label="Undo" side="bottom" sideOffset={10}>
          <Button
            aria-label="Undo"
            disabled={false}
            size="icon"
            variant="ghost"
            onClick={() => {}} // TODO: Add functionality
          >
            <Undo2Icon className="size-4" />
          </Button>
        </Hint>
        <Hint label="Redo" side="bottom" sideOffset={10}>
          <Button
            aria-label="Redo"
            disabled={false}
            size="icon"
            variant="ghost"
            onClick={() => {}} // TODO: Add functionality
          >
            <Redo2Icon className="size-4" />
          </Button>
        </Hint>
        <Separator className="mx-2" orientation="vertical" />
        <div className="flex items-center gap-x-2">
          <BsCloudCheck className="text-muted-foreground size-5" />
          <div className="text-muted-foreground text-xs">Saved</div>
        </div>
        <div className="ml-auto flex items-center gap-x-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                Export
                <DownloadIcon className="ml-4 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => {}} // TODO: Add functionality
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>JSON</p>
                  <p className="text-muted-foreground text-xs">
                    Save for later editing
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => {}} // TODO: Add functionality
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>PNG</p>
                  <p className="text-muted-foreground text-xs">
                    Best for sharing on the web
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => {}} // TODO: Add functionality
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>JPG</p>
                  <p className="text-muted-foreground text-xs">
                    Best for printing
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => {}} // TODO: Add functionality
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>SVG</p>
                  <p className="text-muted-foreground text-xs">
                    Best for editing in vector software
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* TODO: Add user button */}
        </div>
      </div>
    </nav>
  );
};
