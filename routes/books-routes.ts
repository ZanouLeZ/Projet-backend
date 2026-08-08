import path from "node:path";
import { unlink } from "node:fs/promises";
import express from "express";
import protectRoute from "../middleware/protected-routes.ts";
import Books from "../models/books.ts";
import normalizeBookPayload from "../bookPayloads.ts";
import multer from "../middleware/multer-config.ts";

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

const router = express.Router();

const sendBookError = (
  res: express.Response,
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

router.post(
  "/",
  multer,
  protectRoute,
  async (req: express.Request, res: express.Response) => {
    try {
      const payload = normalizeBookPayload(req);
      const book = new Books(payload);
      await book.save();
      res.status(201).json(book);
    } catch (error) {
      return sendBookError(res, error, "Impossible de créer le livre");
    }
  },
);

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const books = await Books.find();
    res.status(200).json(books);
  } catch (error) {
    return sendBookError(res, error, "Impossible de récupérer les livres");
  }
});

router.get(
  "/bestrating",
  async (req: express.Request, res: express.Response) => {
    try {
      const books = await Books.find().sort({ averageRating: -1 }).limit(3);
      res.status(200).json(books);
    } catch (error) {
      return sendBookError(
        res,
        error,
        "Impossible de récupérer les livres les mieux notés",
      );
    }
  },
);

router.get(
  "/search/:name",
  async (req: express.Request, res: express.Response) => {
    try {
      const books = await Books.find({
        title: new RegExp(req.params.name as string, "i"),
      });
      res.status(200).json(books);
    } catch (error) {
      return sendBookError(res, error, "Impossible de rechercher les livres");
    }
  },
);

router.get("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const book = await Books.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });
    res.status(200).json(book);
  } catch (error) {
    return sendBookError(res, error, "Impossible de récupérer le livre");
  }
});

router.put(
  "/:id",
  multer,
  protectRoute,
  async (req: express.Request, res: express.Response) => {
    try {
      const existingBook = await Books.findById(req.params.id);
      if (!existingBook) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      if (String(existingBook.userId) !== String(req.user?._id ?? "")) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à modifier ce livre",
        });
      }

      const payload = normalizeBookPayload(req, existingBook);

      if (req.file || payload.imageUrl === "") {
        await deleteBookImage(existingBook.imageUrl);
      }

      const book = await Books.findByIdAndUpdate(req.params.id, payload, {
        new: true,
      });
      res.status(200).json(book);
    } catch (error) {
      return sendBookError(res, error, "Impossible de modifier le livre");
    }
  },
);

router.delete(
  "/:id",
  protectRoute,
  async (req: express.Request, res: express.Response) => {
    try {
      const book = await Books.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      if (String(book.userId) !== String(req.user?._id ?? "")) {
        return res.status(403).json({
          message: "Vous n'êtes pas autorisé à supprimer ce livre",
        });
      }

      await deleteBookImage(book.imageUrl);
      await Books.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Livre supprimé avec succès" });
    } catch (error) {
      return sendBookError(res, error, "Impossible de supprimer le livre");
    }
  },
);

router.post(
  "/:id/rating",
  protectRoute,
  async (req: express.Request, res: express.Response) => {
    try {
      const { rating } = req.body;

      if (typeof rating !== "number" || rating < 0 || rating > 5) {
        return res
          .status(400)
          .json({ message: "La note doit être un nombre entre 0 et 5" });
      }

      const book = await Books.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      const authenticatedUserId = req.user?._id;
      if (!authenticatedUserId) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }

      const alreadyRated = book.ratings.some(
        (r) => String(r.userId) === String(authenticatedUserId),
      );
      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "Cet utilisateur a déjà noté ce livre" });
      }

      book.ratings.push({ userId: String(authenticatedUserId), grade: rating });
      const totalRating = book.ratings.reduce(
        (sum, r) => sum + Number(r.grade ?? 0),
        0,
      );
      book.averageRating = totalRating / book.ratings.length;

      await book.save();
      res.status(201).json(book);
    } catch (error) {
      return sendBookError(res, error, "Impossible d'ajouter la note");
    }
  },
);

export default router;
