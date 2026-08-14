import type { Response } from "express";

const sendBookError = (
  res: Response,
  error: unknown,
  fallbackMessage: string,
) => {
  console.error(fallbackMessage, error);

  if ((error as { name?: string })?.name === "CastError") {
    return res.status(400).json({ message: "Identifiant de livre invalide" });
  }

  if ((error as { name?: string })?.name === "ValidationError") {
    return res.status(400).json({ message: "Données du livre invalides" });
  }

  return res.status(500).json({ message: fallbackMessage });
};

export default sendBookError;
