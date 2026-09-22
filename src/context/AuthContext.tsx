import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'demo';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  loginWithGoogle: () => void;
  loginAsDemo: () => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'rateshift-auth';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved auth on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // Check if GIS script is already loaded
    if (window.google?.accounts?.id) {
      initializeGoogleAuth();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleAuth();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup - can't easily remove GIS, but it's fine for SPA
    };
  }, []);

  const initializeGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
      auto_select: false,
    });
  }, []);

  const handleGoogleCredentialResponse = useCallback((response: any) => {
    if (!response.credential) {
      setError('Google login failed. Please try again.');
      return;
    }

    // Decode JWT token to get user info
    try {
      const payload = decodeJwt(response.credential);
      const googleUser: User = {
        id: payload.sub,
        name: payload.name || 'User',
        email: payload.email || '',
        picture: payload.picture || '',
        provider: 'google',
      };
      
      setUser(googleUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
      setError(null);
    } catch (e) {
      setError('Failed to process Google credentials.');
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    setError(null);
    
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in environment variables.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setError('Google Sign-In not loaded. Please refresh the page.');
      return;
    }

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: render button
        const buttonDiv = document.getElementById('google-signin-button');
        const gis = window.google;
        if (buttonDiv && gis && gis.accounts && gis.accounts.id) {
          gis.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
          });
          const btn = buttonDiv.querySelector('button');
          if (btn) btn.click();
        }
      }
    });
  }, []);

  const loginAsDemo = useCallback(() => {
    const demoUser: User = {
      id: 'demo-user-001',
      name: 'Mark Thompson',
      email: 'mark@rateshift-demo.co.uk',
      picture: '',
      provider: 'demo',
    };
    setUser(demoUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    
    // Revoke Google token
    const googleAccounts = window.google;
    if (googleAccounts && googleAccounts.accounts && googleAccounts.accounts.id) {
      googleAccounts.accounts.id.disableAutoSelect();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isDemoMode: user?.provider === 'demo',
      loginWithGoogle,
      loginAsDemo,
      logout,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// JWT decode helper (no external dependency needed)
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

// Extend window type for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}
