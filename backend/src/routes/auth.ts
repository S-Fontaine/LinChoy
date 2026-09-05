import { Router } from "express";

import resetPasswordRouter from "./auth/resetPassword.js";
import signupRouter from "./auth/signup.js";
import sessionRouter from "./auth/session.js";
import verifyEmailRouter from "./auth/verifyEmail.js";

const router = Router();

router.use(resetPasswordRouter);
router.use(signupRouter);
router.use(sessionRouter);
router.use(verifyEmailRouter);

export default router;
