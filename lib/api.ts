const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const TOKEN_KEY = "transit_access_token";

/*
 * Save the JWT access token after login.
 */
export function saveAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

/*
 * Get the JWT access token.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

/*
 * Remove the JWT access token.
 */
export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

/*
 * Make an API request to the FastAPI backend.
 *
 * If the user is logged in, the JWT is automatically added:
 *
 * Authorization: Bearer <token>
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(
    options.headers
  );

  /*
   * Only add Content-Type when there is a request body.
   *
   * GET requests don't need it.
   */
  if (options.body && !headers.has("Content-Type")) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  /*
   * Add JWT authentication automatically.
   */
  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  /*
   * Handle unauthorized requests.
   *
   * This means:
   * - no token
   * - expired token
   * - invalid token
   */
  if (response.status === 401) {
    clearAccessToken();

    throw new Error(
      "Not authenticated. Please log in again."
    );
  }

  /*
   * Handle other API errors.
   */
  if (!response.ok) {
    let errorMessage =
      `API request failed: ${response.status}`;

    try {
      const errorData =
        await response.json();

      if (errorData?.detail) {
        errorMessage =
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(
                errorData.detail
              );
      }
    } catch {
      /*
       * Ignore JSON parsing errors.
       */
    }

    throw new Error(errorMessage);
  }

  /*
   * Some DELETE endpoints may return
   * an empty response.
   */
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}