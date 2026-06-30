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
        <li>
          <SidebarItem
            icon={LayoutTemplateIcon}
            isActive={activeTool === "templates"}
            label="Design"
            onClick={() => onChangeActiveTool("templates")}
          />
        </li>
        <li>
          <SidebarItem
            icon={ImageIcon}
            isActive={activeTool === "images"}
            label="Image"
            onClick={() => onChangeActiveTool("images")}
          />
        </li>
        <li>
          <SidebarItem
            icon={TypeIcon}
            isActive={activeTool === "text"}
            label="Text"
            onClick={() => onChangeActiveTool("text")}
          />
        </li>
        <li>
          <SidebarItem
            icon={ShapesIcon}
            isActive={activeTool === "shapes"}
            label="Shapes"
            onClick={() => onChangeActiveTool("shapes")}
          />
        </li>
        <li>
          <SidebarItem
            icon={PencilIcon}
            isActive={activeTool === "draw"}
            label="Draw"
            onClick={() => onChangeActiveTool("draw")}
          />
        </li>
        <li>
          <SidebarItem
            icon={SparklesIcon}
            isActive={activeTool === "ai"}
            label="AI"
            onClick={() => onChangeActiveTool("ai")}
          />
        </li>
        <li>
          <SidebarItem
            icon={SettingsIcon}
            isActive={activeTool === "settings"}
            label="Settings"
            onClick={() => onChangeActiveTool("settings")}
          />
        </li>
      </ul>
    </aside>
  );
};
