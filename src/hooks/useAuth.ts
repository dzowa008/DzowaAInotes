import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';

interface User {
  id: string;
  email: string;
  fullName?: string;
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
  fullName?: string;
}

// Utility to fetch user profile
type FetchProfileResult = UserProfile | null;
const fetchUserProfile = async (userId: string): Promise<FetchProfileResult> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as UserProfile;
};

// Utility to update user profile
const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false
  });

  // Check for existing session on mount and listen for changes
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        // Fetch profile
        const profile = await fetchUserProfile(data.session.user.id);
        setAuthState({
          user: {
            id: data.session.user.id,
            email: data.session.user.email || '',
            fullName: data.session.user.user_metadata?.full_name,
            avatar: data.session.user.user_metadata?.avatar_url,
            profile // attach profile
          },
          isLoading: false,
          isAuthenticated: true
        });
      }
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        // Fetch profile
        const profile = await fetchUserProfile(session.user.id);
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url,
            profile // attach profile
          },
          isLoading: false,
          isAuthenticated: true
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Login with Supabase
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // Custom error message for non-existent account
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.toLowerCase().includes('user not found')
      ) {
        return { success: false, error: 'No account found with this email. Please sign up first.' };
      }
      return { success: false, error: error.message };
    }
    if (data.user) {
      // Fetch profile
      const profile = await fetchUserProfile(data.user.id);
      setAuthState({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name,
          avatar: data.user.user_metadata?.avatar_url,
          profile // attach profile
        },
        isLoading: false,
        isAuthenticated: true
      });
      return { success: true };
    }
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: 'Unknown error' };
  };

  // Sign up with Supabase
  const signUp = async (credentials: SignUpCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName || '',
        }
      }
    });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
    if (data.user) {
      // Create profile in 'profiles' table
      await supabase.from('profiles').insert([
        {
          id: data.user.id,
          full_name: credentials.fullName || '',
          avatar_url: '',
          bio: '',
        }
      ]);
      // Fetch profile
      const profile = await fetchUserProfile(data.user.id);
      setAuthState({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name,
          avatar: data.user.user_metadata?.avatar_url,
          profile // attach profile
        },
        isLoading: false,
        isAuthenticated: true
      });
      return { success: true };
    }
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: 'Unknown error' };
  };

  // Logout with Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
  };

  // Reset password (send email)
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // Social login with Supabase
  const loginWithProvider = async (provider: 'google' | 'github' | 'facebook' | 'twitter' | 'azure' | 'bitbucket' | 'discord' | 'gitlab' | 'slack' | 'spotify' | 'twitch' | 'workos') => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
    // The user will be redirected to the provider and back
    return { success: true };
  };

  return {
    ...authState,
    login,
    signUp,
    logout,
    resetPassword,
    loginWithProvider,
    fetchUserProfile,
    updateUserProfile
  };
}