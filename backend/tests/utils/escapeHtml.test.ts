import { describe, it, expect } from "@jest/globals";
import { escapeHtml } from "../../src/utils/escapeHtml.js";
import { getVerificationEmailTemplate } from "../../src/utils/mailTemplates/verificationEmail.template.js";
import { getPasswordResetTemplate } from "../../src/utils/mailTemplates/passwordReset.template.js";

describe("Test utilitaire: escapeHtml", () => {
  it("Échappe les caractères spéciaux HTML", () => {
    expect(escapeHtml(`<script>alert('x')</script>&"`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;&amp;&quot;",
    );
  });

  it("Laisse une chaîne sans caractères spéciaux inchangée", () => {
    expect(escapeHtml("linchoyTest")).toBe("linchoyTest");
  });
});

describe("Échappement du username dans les templates d'email", () => {
  const maliciousUsername = `<img src=x onerror=alert(1)>`;

  it("Échappe le username dans le template de vérification", () => {
    const { html } = getVerificationEmailTemplate(
      maliciousUsername,
      "https://linchoy.com/verify",
    );
    expect(html).not.toContain(maliciousUsername);
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("Échappe le username dans le template de réinitialisation", () => {
    const { html } = getPasswordResetTemplate(
      maliciousUsername,
      "https://linchoy.com/reset",
    );
    expect(html).not.toContain(maliciousUsername);
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });
});
