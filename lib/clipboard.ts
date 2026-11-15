import { toast } from "sonner";

/** Copies text and confirms with a toast; shows the text itself if copying fails. */
export async function copyText(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    toast.error("Couldn't copy. Here it is:", { description: text });
  }
}
