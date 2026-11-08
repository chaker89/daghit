import { create as createAxios, isAxiosError, type AxiosError, type Method } from 'axios';
import { getAccessToken, getSession, signOut } from '@/auth/session';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
const api = createAxios({
  baseURL: baseUrl,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

type ExecuteOptions = {
  method?: Method;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  authenticated?: boolean;
  validate?: (value: unknown) => boolean;
};

export const execute = async <Response,>(path: string, options: ExecuteOptions = {}): Promise<Response> => {
  if (!baseUrl) {
    throw new Error('The service is not connected yet. Please try again later.');
  }

  const isSecureUrl = /^https:\/\//i.test(baseUrl);
  const isAllowedDevelopmentUrl = __DEV__ && /^http:\/\//i.test(baseUrl);

  if (!isSecureUrl && !isAllowedDevelopmentUrl) {
    throw new Error('The service URL must use HTTPS.');
  }

  const token = options.authenticated ? getAccessToken() : null;

  if (options.authenticated && !token) {
    throw new Error('Please log in to continue.');
  }

  try {
    const response = await api.request<unknown>({
      url: path,
      method: options.method ?? 'GET',
      params: options.params,
      ...(options.body === undefined ? {} : { data: options.body }),
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (options.validate && !options.validate(response.data)) {
      throw new Error('The service returned an unexpected response. Please try again later.');
    }

    return response.data as Response;
  } catch (error) {
    if (error instanceof Error && !isAxiosError(error)) {
      throw error;
    }

    const requestError = error as AxiosError;
    const status = requestError.response?.status;

    if (status === 401 && options.authenticated && token && getSession()?.accessToken === token) {
      void signOut().catch(() => {});
    }

    if (status === 401 && options.authenticated) {
      throw new Error('Your session has ended. Please log in again.');
    }

    if (status) {
      throw new Error(`Request failed (${status}). Please try again.`);
    }

    throw new Error('Unable to reach the service. Check your connection and try again.');
  }
}
