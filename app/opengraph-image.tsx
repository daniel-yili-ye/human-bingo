import { OG_SIZE, siteImage } from "@/lib/og";

export const alt = "Human Bingo: a bingo card where every square is a person";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return siteImage();
}
