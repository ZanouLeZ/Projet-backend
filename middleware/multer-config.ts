import multer from "multer";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, "images");
  },

  filename: (_req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];

    if (!extension) {
      return callback(
        new Error(`Type d'image non supporté : ${file.mimetype}`),
        "",
      );
    }

    const name = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    callback(null, `${name}-${Date.now()}.${extension}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!MIME_TYPES[file.mimetype]) {
    return callback(new Error(`Format non autorisé : ${file.mimetype}`));
  }

  callback(null, true);
};

export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");
//convertir en webp
//modification de la taille de l'image
//verifier le type de l'image
