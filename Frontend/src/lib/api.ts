import { v4 as uuidv4 } from 'uuid';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) headers.set('Authorization', `Bearer ${token}`);
  
  // Add idempotency key for mutations (POST, PATCH, PUT)
  if (['POST', 'PATCH', 'PUT'].includes(options.method?.toUpperCase() || 'GET')) {
    if (!headers.has('X-Idempotency-Key')) {
      headers.set('X-Idempotency-Key', uuidv4());
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || 'API request failed');
  }
  return response.json();
}
