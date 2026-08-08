import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./middleware/auth.ts";
import bookRoutes from "./routes/books-routes.ts";
import path from "node:path";
import multer from "multer";
import { ImageUploadError } from "./middleware/multer-config.ts";

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error: Error) => console.log("Connexion à MongoDB échouée !", error));

app.use("/images", express.static(path.join(process.cwd(), "images")));

// Middleware CORS
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  },
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Erreur non gérée", error);

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "L'image ne doit pas dépasser 5 Mo"
          : "Le fichier image envoyé est invalide";

      return res.status(400).json({ message });
    }

    if (error instanceof ImageUploadError) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Une erreur interne est survenue",
    });
  },
);

export default app;
