import { llms } from "fumadocs-core/source";
import { getSource } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const source = await getSource();

  return new Response(llms(source).index(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
