import crypto from "crypto";
import express from "express";
import mongoose from "mongoose";
import User from "../models/users.ts";

const router = express.Router();

type StoredUser = {
  _id: string;
  email: string;
  password: string;
};

const inMemoryUsers: StoredUser[] = [];

const hashPassword = (password: string) =>
  crypto.createHash("sha256").update(password).digest("hex");

const createToken = () => crypto.randomBytes(16).toString("hex");

const findUserByEmail = async (email: string) => {
  if (mongoose.connection.readyState === 1) {
    return User.findOne({ email }).lean();
  }

  return inMemoryUsers.find((user) => user.email === email) ?? null;
};

const saveUser = async (email: string, password: string) => {
  if (mongoose.connection.readyState === 1) {
    return User.create({ email, password });
  }

  const user: StoredUser = {
    _id: new mongoose.Types.ObjectId().toString(),
    email,
    password,
  };

  inMemoryUsers.push(user);
  return user;
};

router.post("/signup", async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Cet utilisateur existe déjà" });
    }

    const hashedPassword = hashPassword(password);
    await saveUser(email, hashedPassword);

    return res.status(201).json({ message: "Compte créé avec succès" });
  } catch (error) {
    console.error("Signup error", error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la création du compte" });
  }
});

router.post("/login", async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    return res.status(200).json({
      message: "Connexion réussie",
      token: createToken(),
      userId: user._id?.toString?.() ?? user._id,
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});

export default router;
