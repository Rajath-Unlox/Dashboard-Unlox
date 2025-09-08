// Utility functions for authentication and API calls

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Makes an authenticated API request with automatic token refresh
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = localStorage.getItem('accessToken');
  
  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If token expired, try to refresh and retry the request
  if (response.status === 401) {
    const refreshSuccess = await refreshAccessToken();
    
    if (refreshSuccess) {
      // Retry the request with new token
      const newAccessToken = localStorage.getItem('accessToken');
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: newHeaders,
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  return response;
}

/**
 * Refreshes the access token using the refresh token
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Update tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Checks if user is authenticated by verifying token existence and validity
 */
export function isAuthenticated(): boolean {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  return !!(accessToken || refreshToken);
}

/**
 * Clears all authentication tokens from localStorage
 */
export function clearAuthTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Clear the cookie flag as well
  document.cookie = 'hasTokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Gets the current user information from the API
 */
export async function getCurrentUser() {
  try {
    const response = await authenticatedFetch('/auth/me');
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Logout function that clears tokens and calls logout API
 */
export async function logoutUser(): Promise<void> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    clearAuthTokens();
  }
}

/**
 * Login function that authenticates user and stores tokens
 */
export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ org_email: email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store tokens
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Set cookie flag
      document.cookie = 'hasTokens=true; path=/';
      
      return { success: true, user: data.user };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}