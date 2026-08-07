import multer from "multer";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import type { Request, Response, NextFunction } from "express";

const MIME_TYPES: Record<string, string> = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!MIME_TYPES[file.mimetype]) {
    return callback(new Error(`Format non autorisé : ${file.mimetype}`));
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");

const buildFileName = (originalName: string) => {
  const name = path
    .parse(originalName)
    .name.replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");

  return `${name}-${Date.now()}.webp`;
};

const uploadImage = (req: Request, res: Response, next: NextFunction) => {
  upload(req as any, res as any, async (error: unknown) => {
    if (error) {
      return next(error);
    }

    if (!req.file) {
      return next();
    }

    try {
      const outputFileName = buildFileName(req.file.originalname);
      const outputPath = path.resolve(process.cwd(), "images", outputFileName);

      await mkdir(path.dirname(outputPath), { recursive: true });

      const optimizedBuffer = await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      await writeFile(outputPath, optimizedBuffer);

      req.file.filename = outputFileName;
      req.file.path = outputPath;
      req.file.mimetype = "image/webp";
      req.file.originalname = outputFileName;
      next();
    } catch (processingError) {
      next(processingError);
    }
  });
};

export default uploadImage;
