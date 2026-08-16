import { revalidatePath } from "next/cache";

export async function revalidateDocs(): Promise<void> {
  const { invalidateDocsSource } = await import("@/lib/source");
  invalidateDocsSource();
  revalidatePath("/", "layout");
  revalidatePath("/docs", "layout");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
  revalidatePath("/api/search");
}
