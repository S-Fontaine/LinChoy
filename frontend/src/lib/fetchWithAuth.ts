const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  let res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      res = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        credentials: "include",
      });
    }
  }

  return res;
}