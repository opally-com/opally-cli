import { getApiKey, getBaseUrl } from "./config.js";

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateId(id: string): string {
  if (!ID_PATTERN.test(id)) {
    console.error("Invalid ID format. IDs must be alphanumeric (with - and _ allowed).");
    process.exit(1);
  }
  return id;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
  };
}

export interface SingleResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: string | null;
}

export async function api<T>(
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(`/api/v1${path}`, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    // Response is not JSON
  }

  if (!res.ok) {
    if (body && typeof body === "object" && "error" in body) {
      const err = body as ApiError;
      console.error(`Error ${res.status}: ${err.error}`);
      if (err.details) console.error(`Details: ${err.details}`);
    } else {
      console.error(`Error ${res.status}: ${res.statusText || "Request failed"}`);
      if (text) console.error("Response:", text.slice(0, 500));
    }
    process.exit(1);
  }

  if (body === null) {
    console.error("Error: Expected JSON response but received non-JSON body");
    process.exit(1);
  }

  return body as T;
}
