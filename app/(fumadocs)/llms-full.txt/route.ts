import { getLLMText } from "@/lib/get-llm-text";
import { getSource } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const source = await getSource();
  const scanned = source.getPages().map(getLLMText);

  return new Response(scanned.join("\n\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
