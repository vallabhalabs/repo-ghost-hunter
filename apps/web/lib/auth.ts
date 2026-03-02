import { NextResponse } from 'next/server';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // Important for HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login for 401 errors
      throw new ApiError(401, 'Unauthorized - Please log in');
    }
    
    throw new ApiError(
      response.status,
      response.statusText || 'Request failed',
      response.status.toString(),
    );
  }

  return response.json();
}

export async function getAuthUser(): Promise<User | null> {
  try {
    const response = await fetchWithAuth<{ user: User }>('/auth/me');
    return response.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function login(): Promise<void> {
  await fetchWithAuth('/auth/github');
}
