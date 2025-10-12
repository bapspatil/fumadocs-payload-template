"use client";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy, PencilIcon } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const cache = new Map<string, string>();

export function LLMCopyButton({ slug }: { slug: string[] }) {
	const [isLoading, setLoading] = useState(false);
	const [checked, onClick] = useCopyButton(async () => {
		setLoading(true);

		const url = `/llms.mdx/${slug.join("/")}`;
		try {
			const cached = cache.get(url);

			if (cached) {
				await navigator.clipboard.writeText(cached);
			} else {
				await navigator.clipboard.write([
					new ClipboardItem({
						"text/plain": fetch(url).then(async (res) => {
							const content = await res.text();
							cache.set(url, content);

							return content;
						}),
					}),
				]);
			}
		} finally {
			setLoading(false);
		}
	});

	return (
		<button
			className={cn(
				buttonVariants({
					variant: "outline",
					size: "sm",
					className: "gap-2 hover:cursor-pointer [&_svg]:size-3.5",
				}),
			)}
			disabled={isLoading}
			onClick={onClick}
		>
			{checked ? <Check /> : <Copy />}
			Copy Markdown
		</button>
	);
}

export function EditButton(props: { payloadUrl: string }) {
	return (
		<a
			className={cn(
				buttonVariants({
					variant: "outline",
					size: "sm",
					className: "gap-2 [&_svg]:size-3.5",
				}),
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
