/**
 * Centralized API Service Client for Swayamsiddha
 * Connects to the Node.js/Express backend using credentials: 'include' for HttpOnly cookie sessions.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_BASE_URL = `${BACKEND_URL}/api`;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Core fetch wrapper with JSON serialization, error normalization, and cookie credentials.
 */
async function request(endpoint, { method = 'GET', body, headers = {}, isBlob = false, ...customConfig } = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const config = {
    method,
    credentials: 'include',
    headers: {
      ...(!isBlob && body && typeof body === 'object' ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (body && !isBlob && typeof body === 'object') {
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // non-JSON response or parse error
    }

    const errorMessage =
      errorData.error ||
      errorData.message ||
      `Request failed with status ${response.status}`;

    // If 401 Unauthorized, dispatch global event so auth state can cleanly reset without redirect loops
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    const err = new ApiError(errorMessage, response.status, errorData);
    throw err;
  }

  if (isBlob) {
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || '';
    let filename = 'swayamsiddha-report.xlsx';
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
    return { blob, filename };
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => request(endpoint, { method: 'POST', body, ...options }),
  patch: (endpoint, body, options = {}) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options = {}) => request(endpoint, { method: 'DELETE', ...options }),
  download: (endpoint, options = {}) => request(endpoint, { method: 'GET', isBlob: true, ...options }),
};

/**
 * Backwards compatibility helper
 */
export async function apiClient(endpoint, config = {}) {
  const method = config.method || (config.body ? 'POST' : 'GET');
  return request(endpoint, { method, ...config });
}

export default api;
