import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";
import User from "../models/users.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

export const comparePassword = (password: string, hashedPassword: string) =>
  bcrypt.compareSync(password, hashedPassword);

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7h" });

export const protectRoute = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant ou invalide" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };

    if (!decoded.userId) {
      return res.status(401).json({ message: "Token invalide" });
    }

    const user = await User.findById(decoded.userId).select("_id email").lean();
    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    req.user = {
      _id: String(user._id),
      email: String(user.email),
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

export default protectRoute;
