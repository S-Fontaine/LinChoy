import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { mailer, transporter } from "../../src/utils/mailer.js";

describe("Test utilitaire: mailer", () => {
  let sendMailSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    jest.restoreAllMocks();
    sendMailSpy = jest
      .spyOn(transporter, "sendMail")
      .mockResolvedValue(undefined as never);
  });

  describe("sendVerificationEmail", () => {
    it("Envoie un email avec le bon destinataire, sujet et token", async () => {
      await mailer.sendVerificationEmail(
        "test@linchoy.com",
        "token123",
        "linchoyTest",
      );

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      const callArg = sendMailSpy.mock.calls[0][0] as { to: string; subject: string; html: string; text: string };
      expect(callArg.to).toBe("test@linchoy.com");
      expect(callArg.subject).toMatch(/activez/i);
      expect(callArg.html).toContain("token123");
      expect(callArg.text).toContain("token123");
    });

    it("Propage l'erreur si l'envoi échoue", async () => {
      sendMailSpy.mockRejectedValueOnce(new Error("SMTP down"));

      await expect(
        mailer.sendVerificationEmail("test@linchoy.com", "token123", "linchoyTest"),
      ).rejects.toThrow("SMTP down");
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("Envoie un email avec le lien de réinitialisation", async () => {
      await mailer.sendPasswordResetEmail(
        "test@linchoy.com",
        "resetTok",
        "linchoyTest",
      );

      const callArg = sendMailSpy.mock.calls[0][0] as { to: string; subject: string; html: string };
      expect(callArg.to).toBe("test@linchoy.com");
      expect(callArg.subject).toMatch(/réinitialise/i);
      expect(callArg.html).toContain("resetTok");
    });

    it("Propage l'erreur si l'envoi échoue", async () => {
      sendMailSpy.mockRejectedValueOnce(new Error("SMTP down"));

      await expect(
        mailer.sendPasswordResetEmail("test@linchoy.com", "tok", "linchoyTest"),
      ).rejects.toThrow("SMTP down");
    });
  });
});