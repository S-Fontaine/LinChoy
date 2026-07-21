const isProd = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  domain: isProd ? ".linchoy.com" : undefined,
  maxAge: 15 * 60 * 1000,
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  domain: isProd ? ".linchoy.com" : undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/auth/refresh",
};
