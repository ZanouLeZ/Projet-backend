import express from "express";
import Books from "../models/books.ts";
import Ratings from "../models/users.ts";

const router = express.Router();

router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const book = new Books({
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      price: req.body.price,
      userId: req.body.userId,
    });
    await book.save();
    res.status(201).json({
      message: "Book saved successfully!",
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const books = await Books.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get(
  "/bestrating",
  async (req: express.Request, res: express.Response) => {
    try {
      const books = await Books.find().sort({ rating: -1 });
      res.status(200).json(books);
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);

router.get("/:name", async (req: express.Request, res: express.Response) => {
  try {
    const book = await Books.find({
      title: new RegExp(req.params.name as string, "i"),
    });
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ error });
  }
});
router.get("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const book = await Books.findById(req.params.id);
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.put("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const book = await Books.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
});

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
      const rating = new Ratings({
        userId: req.body.userId,
        bookId: req.params.id,
        rating: req.body.rating,
      });
      await rating.save();
      res.status(201).json({
        message: "Rating saved successfully!",
      });
    } catch (error) {
      res.status(400).json({ error });
    }
  },
);

export default router;
