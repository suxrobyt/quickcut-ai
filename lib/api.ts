import { APIResponse } from '@/lib/types';
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 30000,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiCall = async <T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: unknown,
  options?: Record<string, unknown>
): Promise<APIResponse<T>> => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...options,
    });

    return {
      data: response.data as T,
      status: response.status,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    const errorMessage = axiosError.response?.data?.error || axiosError.message || 'An error occurred';

    return {
      error: errorMessage,
      status: axiosError.response?.status || 500,
    };
  }
};

// Convenience methods
export const apiGet = <T = unknown>(url: string) => apiCall<T>('GET', url);

export const apiPost = <T = unknown>(url: string, data?: unknown) =>
  apiCall<T>('POST', url, data);

export const apiPut = <T = unknown>(url: string, data?: unknown) =>
  apiCall<T>('PUT', url, data);

export const apiDelete = <T = unknown>(url: string) => apiCall<T>('DELETE', url);

export const apiPatch = <T = unknown>(url: string, data?: unknown) =>
  apiCall<T>('PATCH', url, data);

// File upload with progress
export const uploadFile = async (
  projectId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await new Promise<{ url: string; path: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress?.(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `/api/projects/${projectId}/upload`);
      xhr.send(formData);
    });

    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Upload failed');
  }
};
