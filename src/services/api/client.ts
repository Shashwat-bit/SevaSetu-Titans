const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AUTH_TOKEN_KEY = 'sevasetu_jwt_token_v3';

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach Authorization Bearer token if stored
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // localStorage not accessible
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // If 401 Unauthorized, dispatch event for auth state cleanup
      if (response.status === 401) {
        try {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          window.dispatchEvent(new CustomEvent('sevasetu-unauthorized'));
        } catch {
          // ignore
        }
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData?.error?.message || errorData?.message || 'API request failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || 'Network connection failed or backend unreachable',
      0,
      err
    );
  }
}
