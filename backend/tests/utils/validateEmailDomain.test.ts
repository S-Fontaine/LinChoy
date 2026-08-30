import { describe, it, expect } from "@jest/globals";
import { emailValidator } from "../../src/utils/validateEmailDomain.js";

describe("Test utilitaire: domainHasMailServer", () => {
  it("Retourne true pour un domaine avec MX valide", async () => {
    const result = await emailValidator.domainHasMailServer("test@gmail.com");
    expect(result).toBe(true);
  });

  it("Retourne false pour un domaine inexistant", async () => {
    const result = await emailValidator.domainHasMailServer("test@qsdxcv.com");
    expect(result).toBe(false);
  });

  it("Retourne false pour une adresse mal formée", async () => {
    const result = await emailValidator.domainHasMailServer("pas-un-email");
    expect(result).toBe(false);
  });
});
