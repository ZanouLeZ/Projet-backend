import express from "express";

const router = express.Router();

router.get("/signup", (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Signup route" });
});

router.get("/login", (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Login route" });
});
export default router;
