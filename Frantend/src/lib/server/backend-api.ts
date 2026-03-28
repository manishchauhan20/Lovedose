const backendBaseUrl = (process.env.BACKEND_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

export async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

export function getBackendBaseUrl() {
  return backendBaseUrl;
}
