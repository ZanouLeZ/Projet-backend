import type { Request, Response } from "express";
import {
  comparePassword,
  generateToken,
} from "../../middleware/protected-routes.ts";
import { findUserByEmail } from "../../utils/auth/user-store.ts";

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isPasswordValid = comparePassword(
      password,
      String(user.password ?? ""),
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    return res.status(200).json({
      message: "Connexion réussie",
      token: generateToken(String(user._id?.toString?.() ?? user._id)),
      userId: String(user._id?.toString?.() ?? user._id),
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export default login;
