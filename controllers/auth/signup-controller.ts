import type { Request, Response } from "express";
import { hashPassword } from "../../middleware/protected-routes.ts";
import {
  findUserByEmail,
  saveUser,
} from "../../utils/auth/user-store.ts";

const signup = async (req: Request, res: Response) => {
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
};

export default signup;
