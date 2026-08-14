import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ImageUploadError } from "./multer-config.ts";

const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Erreur non gérée", error);

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "L'image ne doit pas dépasser 5 Mo"
        : "Le fichier image envoyé est invalide";

    return res.status(400).json({ message });
  }

  if (error instanceof ImageUploadError) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({
    message: "Une erreur interne est survenue",
  });
};

export default errorHandler;
