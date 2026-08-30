import { Router } from "express";
import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { getSteamRedirectUrl, verifySteamOpenId } from "../utils/steamAuth.js";
import { handleMongooseError } from "../utils/handleMongooseError.js";
import type { Response } from "express";

const router = Router();
const BACKEND_URL = process.env.BACKEND_URL as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

function sendSteamPopupResponse(
  res: Response,
  payload:
    | { success: true; steamId: string }
    | { success: false; error: string },
) {
  res.set("Content-Type", "text/html");
  return res.send(`<!DOCTYPE html>
<html>
<body>
<script>
  if (window.opener) {
    window.opener.postMessage(
      ${JSON.stringify({ type: "steam-link", ...payload })},
      ${JSON.stringify(FRONTEND_URL)}
    );
  }
  window.close();
</script>
</body>
</html>`);
}

router.get("/link", requireAuth, (req: AuthRequest, res) => {
  const returnUrl = `${BACKEND_URL}/steam/link/callback`;
  const redirectUrl = getSteamRedirectUrl(returnUrl, BACKEND_URL);
  return res.redirect(redirectUrl);
});

router.get("/link/callback", async (req, res) => {
  const token = req.cookies?.accessToken;
  let userId: string;
  try {
    if (!token) throw new Error("Token manquant");
    userId = verifyAccessToken(token).userId;
  } catch {
    return sendSteamPopupResponse(res, {
      success: false,
      error: "session_expired",
    });
  }

  try {
    const steamId = await verifySteamOpenId(
      req.query as Record<string, string>,
    );

    const alreadyLinked = await User.findOne({ steamId });
    if (alreadyLinked && alreadyLinked._id.toString() !== userId) {
      return sendSteamPopupResponse(res, {
        success: false,
        error: "already_linked",
      });
    }

    await User.findByIdAndUpdate(userId, { steamId });

    return sendSteamPopupResponse(res, { success: true, steamId });
  } catch (err) {
    console.error("[steam]: Échec de la vérification", err);
    return sendSteamPopupResponse(res, { success: false, error: "invalid" });
  }
});

router.delete("/link", requireAuth, async (req: AuthRequest, res) => {
  try {
    await User.findByIdAndUpdate(req.user?.userId, { steamId: null });
    return res
      .status(200)
      .json({ result: true, message: "Compte Steam délié" });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

export default router;
