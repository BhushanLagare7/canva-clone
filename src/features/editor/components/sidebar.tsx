"use client";

import {
  ImageIcon,
  LayoutTemplateIcon,
  PencilIcon,
  SettingsIcon,
  ShapesIcon,
  SparklesIcon,
  TypeIcon,
} from "lucide-react";

import { SidebarItem } from "@/features/editor/components/sidebar-item";
import { ActiveTool } from "@/features/editor/types";

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const Sidebar = ({ activeTool, onChangeActiveTool }: SidebarProps) => {
  return (
    <aside className="flex h-full w-25 flex-col overflow-y-auto border-r bg-white">
      <ul className="flex flex-col">
        <SidebarItem
          icon={LayoutTemplateIcon}
          isActive={activeTool === "templates"}
          label="Design"
          onClick={() => onChangeActiveTool("templates")}
        />
        <SidebarItem
          icon={ImageIcon}
          isActive={activeTool === "images"}
          label="Image"
          onClick={() => onChangeActiveTool("images")}
        />
        <SidebarItem
          icon={TypeIcon}
          isActive={activeTool === "text"}
          label="Text"
          onClick={() => onChangeActiveTool("text")}
        />
        <SidebarItem
          icon={ShapesIcon}
          isActive={activeTool === "shapes"}
          label="Shapes"
          onClick={() => onChangeActiveTool("shapes")}
        />
        <SidebarItem
          icon={PencilIcon}
          isActive={activeTool === "draw"}
          label="Draw"
          onClick={() => onChangeActiveTool("draw")}
        />
        <SidebarItem
          icon={SparklesIcon}
          isActive={activeTool === "ai"}
          label="AI"
          onClick={() => onChangeActiveTool("ai")}
        />
        <SidebarItem
          icon={SettingsIcon}
          isActive={activeTool === "settings"}
          label="Settings"
          onClick={() => onChangeActiveTool("settings")}
        />
      </ul>
    </aside>
  );
};
