import type { Request, Response } from "express";
import normalizeBookPayload from "../../utils/books/bookPayloads.ts";
import Books from "../../models/books.ts";
import sendBookError from "../../utils/books/send-book-error.ts";

const createBook = async (req: Request, res: Response) => {
  try {
    const payload = normalizeBookPayload(req);
    const book = new Books(payload);
    await book.save();
    return res.status(201).json(book);
  } catch (error) {
    return sendBookError(res, error, "Impossible de créer le livre");
  }
};

export default createBook;
