const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  let res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      res = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        credentials: "include",
      });
    } else {
      window.location.href = "/";
      return res;
    }
  }

  return res;
}
