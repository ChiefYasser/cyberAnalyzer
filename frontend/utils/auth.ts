// Token storage utilities for user authentication

/**
 * Gets the authentication token from browser storage
 * Returns null if we're on the server or no token exists
 */
export const getToken = (): string | null => {
  // Can't access localStorage on the server
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('token');
};

/**
 * Saves the authentication token to browser storage
 */
export const setToken = (token: string): void => {
  // Only run this in the browser
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('token', token);
};

/**
 * Clears the authentication token from browser storage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
};

/**
 * Checks if the user has a token (is logged in)
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token; // Convert to boolean - token exists = true
}

/**
 * Extracts user information from the JWT token
 * Note: This only decodes the token, it doesn't verify it's valid!
 * Always verify tokens on the server before trusting them.
 */
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  
  try {
    // JWT tokens have 3 parts separated by dots
    // The middle part contains the user data
    const middlePart = token.split('.')[1];
    
    // Decode the base64-encoded data
    const decodedData = JSON.parse(atob(middlePart));
    
    // This usually contains things like: { id, role, iat, exp }
    return decodedData;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Checks if the current user has admin privileges
 */
export function isAdmin(): boolean {
  const user = getUserFromToken();
  
  // Check if user exists and has admin role (case-insensitive)
  return !!user && (user.role === 'admin' || user.role === 'Admin');
}

/**
 * Logs the user out completely
 * Clears their token and sends them back to the login page
 */
export function logout(): void {
  try {
    // Clear the token first
    removeToken();
    
    // Then redirect to login (only in browser)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Something went wrong during logout:', error);
  }
}