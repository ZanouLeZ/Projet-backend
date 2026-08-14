import type { Request, Response } from "express";
import Books from "../../models/books.ts";
import deleteBookImage from "../../utils/books/delete-book-image.ts";
import sendBookError from "../../utils/books/send-book-error.ts";

const deleteBook = async (req: Request, res: Response) => {
  try {
    const book = await Books.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    if (String(book.userId) !== String(req.user?._id ?? "")) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce livre",
      });
    }

    await deleteBookImage(book.imageUrl);
    await Books.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    return sendBookError(res, error, "Impossible de supprimer le livre");
  }
};

export default deleteBook;
