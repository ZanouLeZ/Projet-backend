import express from "express";
import multer from "multer";
import Books from "../models/books.ts";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const parseBookPayload = (req: express.Request) => {
  const body = req.body ?? {};
  const candidate = typeof body === "object" && body !== null ? body : {};

  if (candidate.book && typeof candidate.book === "string") {
    try {
      return JSON.parse(candidate.book);
    } catch {
      return candidate;
    }
  }

  if (candidate.book && typeof candidate.book === "object") {
    return candidate.book;
  }

  return candidate;
};

const normalizeBookPayload = (req: express.Request) => {
  const payload = parseBookPayload(req) as Record<string, any>;
  const inputRatings = Array.isArray(payload.ratings) ? payload.ratings : [];
  const firstRating = inputRatings[0] ?? {};

  const normalizedRatings = inputRatings.map((rating: any) => ({
    userId: rating.userId ?? payload.userId ?? "anonymous",
    grade: Number(rating.grade ?? 0),
  }));

  if (payload.rating !== undefined && normalizedRatings.length === 0) {
    normalizedRatings.push({
      userId: payload.userId ?? "anonymous",
      grade: Number(payload.rating ?? 0),
    });
  }

  const averageRating = Number(
    payload.averageRating ?? payload.rating ?? firstRating.grade ?? 0,
  );

  return {
    userId: payload.userId ?? "anonymous",
    title: payload.title ?? "Sans titre",
    author: payload.author ?? "Auteur inconnu",
    imageUrl:
      payload.imageUrl ?? "https://via.placeholder.com/300x450?text=Book",
    year: Number(payload.year ?? 0),
    genre: payload.genre ?? "Non spécifié",
    ratings: normalizedRatings,
    averageRating: normalizedRatings.length
      ? normalizedRatings.reduce(
          (sum, item) => sum + Number(item.grade || 0),
          0,
        ) / normalizedRatings.length
      : averageRating,
  };
};

router.post(
  "/",
  upload.fields([{ name: "book" }, { name: "image" }]),
  async (req: express.Request, res: express.Response) => {
    try {
      const payload = normalizeBookPayload(req);
      const book = new Books(payload);
      await book.save();
      res.status(201).json(book);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error });
    }
  },
);

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const books = await Books.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// IMPORTANT : cette route doit rester AVANT "/:id"
router.get(
  "/bestrating",
  async (req: express.Request, res: express.Response) => {
    try {
      const books = await Books.find().sort({ averageRating: -1 }).limit(3);
      res.status(200).json(books);
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);

// Renommée pour ne plus entrer en conflit avec "/:id"
router.get(
  "/search/:name",
  async (req: express.Request, res: express.Response) => {
    try {
      const books = await Books.find({
        title: new RegExp(req.params.name as string, "i"),
      });
      res.status(200).json(books);
    } catch (error) {
      res.status(404).json({ error });
    }
  },
);

router.get("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const book = await Books.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.put(
  "/:id",
  upload.fields([{ name: "book" }, { name: "image" }]),
  async (req: express.Request, res: express.Response) => {
    try {
      const payload = normalizeBookPayload(req);
      const book = await Books.findByIdAndUpdate(req.params.id, payload, {
        new: true,
      });
      res.status(200).json(book);
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);

router.delete("/:id", async (req: express.Request, res: express.Response) => {
  try {
    await Books.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post(
  "/:id/rating",
  async (req: express.Request, res: express.Response) => {
    try {
      const { userId, rating } = req.body;

      if (typeof rating !== "number" || rating < 0 || rating > 5) {
        return res
          .status(400)
          .json({ message: "La note doit être un nombre entre 0 et 5" });
      }

      const book = await Books.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      const alreadyRated = book.ratings.some((r) => r.userId === userId);
      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "Cet utilisateur a déjà noté ce livre" });
      }

      book.ratings.push({ userId, grade: rating });
      const totalRating = book.ratings.reduce(
        (sum, r) => sum + Number(r.grade ?? 0),
        0,
      );
      book.averageRating = totalRating / book.ratings.length;

      await book.save();
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);

export default router;
