import type { Request, Response } from "express";
import Books from "../../models/books.ts";
import sendBookError from "../../utils/books/send-book-error.ts";

const getOneBook = async (req: Request, res: Response) => {
  try {
    const book = await Books.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });
    return res.status(200).json(book);
  } catch (error) {
    return sendBookError(res, error, "Impossible de récupérer le livre");
  }
};

export default getOneBook;
