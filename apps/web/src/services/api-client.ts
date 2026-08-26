const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8311/api";

function authHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token =
      window.localStorage.getItem("nexora_token") ??
      window.sessionStorage.getItem("nexora_token");

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export async function apiPostWithStatus<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        typeof data?.error === "string"
          ? data.error
          : typeof data?.message === "string"
            ? data.message
            : "Request failed";
      return { data: null, error: errorMsg, status: response.status };
    }

    return { data: data as T, error: null, status: response.status };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message ?? "Network error",
      status: 0,
    };
  }
}

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function apiPatch<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function apiDelete(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    return response.ok;
  } catch {
    return false;
  }
}
