"use client";

import { PencilIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EditButton(props: { payloadUrl: string }) {
  return (
    <a
      className={cn(
        buttonVariants({
          className: "gap-2 [&_svg]:size-3.5",
          size: "sm",
          variant: "outline",
        })
      )}
      href={props.payloadUrl}
      rel="noreferrer noopener"
      target="_blank"
    >
      <PencilIcon className="size-3.5" />
      Edit Page
    </a>
  );
}
