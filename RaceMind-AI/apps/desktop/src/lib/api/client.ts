const defaultApiUrl = import.meta.env.DEV ? 'http://localhost:8000' : 'https://racemind-ai-production.up.railway.app';
const BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

class ApiClient {
  async get<T>(path: string, options?: { params?: Record<string, unknown> }): Promise<{ data: T }> {
    const url = new URL(path, BASE_URL);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed with ${response.status}`);
    }

    const data = await response.json();
    return { data };
  }

  async post<T>(path: string, body: unknown, options?: { headers?: Record<string, string>, params?: Record<string, unknown>, responseType?: string }): Promise<{ data: T }> {
    const url = new URL(path, BASE_URL);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const init: RequestInit = {
      method: 'POST',
      headers: {
        ...(!options?.headers || !options.headers['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
        ...(options?.headers || {})
      },
      body: body instanceof FormData ? body : (body === null ? null : JSON.stringify(body)),
    };
    
    if (options?.headers?.['Content-Type'] === 'multipart/form-data') {
      delete (init.headers as Record<string, string>)['Content-Type'];
    }

    const response = await fetch(url.toString(), init);

    if (!response.ok) {
      throw new Error(`POST ${path} failed with ${response.status}`);
    }

    if (options?.responseType === 'blob') {
      const data = await response.blob() as unknown as T;
      return { data };
    }

    if (!response.ok) {
      throw new Error(`POST ${path} failed with ${response.status}`);
    }

    const data = await response.json();
    return { data };
  }
}

export const apiClient = new ApiClient();
