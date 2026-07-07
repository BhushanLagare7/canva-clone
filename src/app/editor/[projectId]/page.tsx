"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { LoaderIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Editor } from "@/features/editor/components/editor";
import { useGetProject } from "@/features/projects/api/use-get-project";

const EditorProjectIdPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, isLoading, isError } = useGetProject(projectId);

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-y-5">
        <TriangleAlertIcon className="text-muted-foreground size-6" />
        <p className="text-muted-foreground text-sm">Failed to fetch project</p>
        <Button asChild variant="secondary">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <LoaderIcon className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return <Editor initialData={data} />;
};

export default EditorProjectIdPage;
