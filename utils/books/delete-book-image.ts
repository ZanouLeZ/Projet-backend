import path from "node:path";
import { unlink } from "node:fs/promises";

const deleteBookImage = async (imageUrl?: string | number | null) => {
  if (!imageUrl) return;

  try {
    const imageUrlString =
      typeof imageUrl === "string" ? imageUrl : String(imageUrl ?? "");
    const parsedUrl = new URL(imageUrlString, "http://localhost");
    const filename = path.basename(parsedUrl.pathname);

    if (!filename) return;

    await unlink(path.resolve(process.cwd(), "images", filename));
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      console.error("Unable to delete image", error);
    }
  }
};

export default deleteBookImage;
