import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth-routes.ts";
import bookRoutes from "./routes/books-routes.ts";
import path from "node:path";
import cors from "./middleware/cors.ts";
import errorHandler from "./middleware/error-handler.ts";

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error: Error) => console.log("Connexion à MongoDB échouée !", error));

app.use("/images", express.static(path.join(process.cwd(), "images")));

app.use(cors);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.use(errorHandler);

export default app;
