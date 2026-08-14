import type { Request, Response } from "express";
import Books from "../../models/books.ts";
import sendBookError from "../../utils/books/send-book-error.ts";

const getBestRatedBooks = async (_req: Request, res: Response) => {
  try {
    const books = await Books.find().sort({ averageRating: -1 }).limit(3);
    return res.status(200).json(books);
  } catch (error) {
    return sendBookError(
      res,
      error,
      "Impossible de récupérer les livres les mieux notés",
    );
  }
};

export default getBestRatedBooks;
