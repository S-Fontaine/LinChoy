import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.userId });
});

export default router;