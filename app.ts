import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import bookRoutes from "./routes/stuff.ts";

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error: Error) => console.log("Connexion à MongoDB échouée !", error));

// Middleware CORS
app.use(
  (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    next();
  },
);

// Routes
app.use("/api/books", bookRoutes);

//auth

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  next();
});

export default app;
