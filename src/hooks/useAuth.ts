import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials extends LoginCredentials {
  fullName: string;
  confirmPassword: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('smarta_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });
      } catch (error) {
        localStorage.removeItem('smarta_user');
      }
    }
  }, []);

  // Simulate login
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock validation
      if (credentials.email === 'demo@smarta.ai' && credentials.password === 'password123') {
        const user: User = {
          id: '1',
          email: credentials.email,
          fullName: 'Demo User',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        };

        localStorage.setItem('smarta_user', JSON.stringify(user));
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Simulate sign up
  const signUp = async (credentials: SignUpCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));

      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        fullName: credentials.fullName,
        avatar: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
      };

      localStorage.setItem('smarta_user', JSON.stringify(user));
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Sign up failed. Please try again.' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('smarta_user');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send reset email. Please try again.' };
    }
  };

  return {
    ...authState,
    login,
    signUp,
    logout,
    resetPassword
  };
}