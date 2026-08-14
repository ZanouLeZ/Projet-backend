import type { Request, Response } from "express";
import normalizeBookPayload from "../../utils/books/bookPayloads.ts";
import Books from "../../models/books.ts";
import deleteBookImage from "../../utils/books/delete-book-image.ts";
import sendBookError from "../../utils/books/send-book-error.ts";

const updateBook = async (req: Request, res: Response) => {
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
    return res.status(200).json(book);
  } catch (error) {
    return sendBookError(res, error, "Impossible de modifier le livre");
  }
};

export default updateBook;
