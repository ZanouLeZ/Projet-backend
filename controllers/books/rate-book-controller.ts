import type { Request, Response } from "express";
import Books from "../../models/books.ts";
import sendBookError from "../../utils/books/send-book-error.ts";

const rateBook = async (req: Request, res: Response) => {
  try {
    const { rating } = req.body;

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être un nombre entre 0 et 5" });
    }

    const book = await Books.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    const authenticatedUserId = req.user?._id;
    if (!authenticatedUserId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const alreadyRated = book.ratings.some(
      (ratingEntry) =>
        String(ratingEntry.userId) === String(authenticatedUserId),
    );
    if (alreadyRated) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur a déjà noté ce livre" });
    }

    book.ratings.push({ userId: String(authenticatedUserId), grade: rating });
    const totalRating = book.ratings.reduce(
      (sum, ratingEntry) => sum + Number(ratingEntry.grade ?? 0),
      0,
    );
    book.averageRating = totalRating / book.ratings.length;

    await book.save();
    return res.status(201).json(book);
  } catch (error) {
    return sendBookError(res, error, "Impossible d'ajouter la note");
  }
};

export default rateBook;
