import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./middleware/auth.ts";
import bookRoutes from "./routes/stuff.ts";
import path from "node:path";

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

export default app;
