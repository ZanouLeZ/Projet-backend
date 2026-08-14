import express from "express";
import createBook from "../controllers/books/create-book-controller.ts";
import deleteBook from "../controllers/books/delete-book-controller.ts";
import getAllBooks from "../controllers/books/get-all-books-controller.ts";
import getBestRatedBooks from "../controllers/books/get-best-rated-books-controller.ts";
import getOneBook from "../controllers/books/get-one-book-controller.ts";
import rateBook from "../controllers/books/rate-book-controller.ts";
import searchBooks from "../controllers/books/search-books-controller.ts";
import updateBook from "../controllers/books/update-book-controller.ts";
import multer from "../middleware/multer-config.ts";
import protectRoute from "../middleware/protected-routes.ts";

const router = express.Router();

router.post("/", protectRoute, createBook, multer);
router.get("/", getAllBooks);
router.get("/bestrating", getBestRatedBooks);
router.get("/search/:name", searchBooks);
router.get("/:id", getOneBook);
router.put("/:id", protectRoute, updateBook, multer);
router.delete("/:id", protectRoute, deleteBook);
router.post("/:id/rating", protectRoute, rateBook);

export default router;
