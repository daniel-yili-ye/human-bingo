import { getBoardBySlug } from "@/lib/boards";
import { boardImage, OG_SIZE, siteImage } from "@/lib/og";

export const alt = "A Human Bingo card";
export const size = OG_SIZE;
export const contentType = "image/png";

// The image URL stays the same when a board is edited, so it must not be
// cached for long (the default is a year).
const headers = { "Cache-Control": "public, max-age=3600" };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  return board ? boardImage(board, { headers }) : siteImage({ headers });
}
