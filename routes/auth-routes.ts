import express from "express";
import login from "../controllers/auth/login-controller.ts";
import signup from "../controllers/auth/signup-controller.ts";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;
