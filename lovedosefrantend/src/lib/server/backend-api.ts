const backendBaseUrl = (process.env.BACKEND_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");
const backendTimeoutMs = 1500;

export async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), backendTimeoutMs);

  try {
    const response = await fetch(`${backendBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      signal: init?.signal ?? controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status} ${path}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getBackendBaseUrl() {
  return backendBaseUrl;
}
