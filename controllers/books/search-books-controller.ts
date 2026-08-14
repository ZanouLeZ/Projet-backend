import type { Request, Response } from "express";
import Books from "../../models/books.ts";
import sendBookError from "../../utils/books/send-book-error.ts";

const searchBooks = async (req: Request, res: Response) => {
  try {
    const books = await Books.find({
      title: new RegExp(req.params.name as string, "i"),
    });
    return res.status(200).json(books);
  } catch (error) {
    return sendBookError(res, error, "Impossible de rechercher les livres");
  }
};

export default searchBooks;
