import { Router } from "express";
import { handleMongooseError } from "../../utils/handleMongooseError.js";
import User from "../../models/User.js";
import { generateVerifyToken } from "../../utils/auth/jwt.js";
import { mailer } from "../../utils/mailer.js";
import { authLimiter } from "../../middlewares/rateLimit.js";
import { emailValidator } from "../../utils/validateEmailDomain.js";

const router = Router();

router.post("/signup", authLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof username !== "string" ||
    !username.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({ result: false, message: "Champs manquants" });
  }

  let newUser;
  const successMessage = "Compte créé. Vérifiez votre email pour l'activer.";

  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(409)
        .json({ result: false, message: "Ce nom d'utilisateur est déjà pris" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(201).json({ result: true, message: successMessage });
    }
  } catch (err) {
    return handleMongooseError(err, res);
  }

  const hasMailServer = await emailValidator.domainHasMailServer(email);
  if (!hasMailServer) {
    return res.status(400).json({
      result: false,
      message:
        "Cette adresse email ne semble pas valide (domaine introuvable).",
    });
  }

  try {
    newUser = await User.create({ username, email, password });
  } catch (err) {
    return handleMongooseError(err, res);
  }

  try {
    const verifyToken = generateVerifyToken({ userId: newUser._id.toString() });
    await mailer.sendVerificationEmail(
      newUser.email,
      verifyToken,
      newUser.username,
    );
  } catch (err) {
    console.error("[mail]: Échec d'envoi de l'email de vérification", err);

    const isRecipientRejected =
      err instanceof Error && "code" in err && err.code === "EENVELOPE";

    return res.status(201).json({
      result: true,
      message: isRecipientRejected
        ? "Compte créé, mais cette adresse email semble invalide. Vérifiez son orthographe."
        : "Compte créé, mais l'email de vérification n'a pas pu être envoyé. Réessayez plus tard.",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  }

  return res.status(201).json({
    result: true,
    message: successMessage,
    data: { id: newUser._id, username: newUser.username, email: newUser.email },
  });
});

export default router;