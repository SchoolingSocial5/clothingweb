type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: ApiMethod;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {}, isFormData = false } = options;

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...headers,
  };

  // Skip Content-Type for FormData as browser adds it with boundary
  if (!isFormData && body && !(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Get token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body) {
    fetchOptions.body = isFormData || body instanceof FormData ? body : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: any) {
    console.error('Network Error:', err);
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error(`Could not connect to the API server at ${BASE_URL}. Please ensure the backend is running.`);
    }
    throw err;
  }

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/sign-in';
      }
    }
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    const error: any = new Error(errorData.message || `Request failed with status ${response.status}`);
    error.data = errorData;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  return response.json();
};
