import dns from "dns/promises";

export const emailValidator = {
  async domainHasMailServer(email: string): Promise<boolean> {
    const domain = email.split("@")[1];
    if (!domain) return false;

    try {
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords.length > 0;
    } catch {
      return false;
    }
  },
};
