'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/types/financial';
import { DEMO_USER } from '@/lib/mockData';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'life_plan_360_user_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function initializeAuth() {
      // 1. Check if Supabase is active
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
            setIsDemo(false);
            // Fetch profile
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (prof) {
              setProfile(prof as UserProfile);
            } else {
              setProfile({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                currency: 'INR',
                monthly_budget_target: 50000,
                current_age: 30,
                retirement_age: 60,
              });
            }
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }
      }

      // 2. Check localStorage session (Demo or offline)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser({ id: parsed.id, email: parsed.email });
            setProfile(parsed);
            setIsDemo(parsed.id === DEMO_USER.id);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing stored user', e);
          }
        }

        // Auto login as demo user for instant seamless experience
        setUser({ id: DEMO_USER.id, email: DEMO_USER.email });
        setProfile(DEMO_USER);
        setIsDemo(true);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEMO_USER));
      }

      setIsLoading(false);
    }

    initializeAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
            setIsDemo(false);
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (prof) setProfile(prof as UserProfile);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setIsDemo(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            }
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        setIsDemo(false);
      }
      setIsLoading(false);
      return {};
    } else {
      // Offline/Local login simulation
      const mockProfile: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        currency: 'INR',
        monthly_budget_target: 50000,
        current_age: 30,
        retirement_age: 60,
      };
      setUser({ id: mockProfile.id, email });
      setProfile(mockProfile);
      setIsDemo(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
      }
      setIsLoading(false);
      return {};
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        const newProf: UserProfile = {
          id: data.user.id,
          email,
          full_name: fullName,
          currency: 'INR',
          monthly_budget_target: 50000,
          current_age: 30,
          retirement_age: 60,
        };
        setProfile(newProf);
      }
      setIsLoading(false);
      return {};
    } else {
      const newProf: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        currency: 'INR',
        monthly_budget_target: 50000,
        current_age: 30,
        retirement_age: 60,
      };
      setUser({ id: newProf.id, email });
      setProfile(newProf);
      setIsDemo(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProf));
      }
      setIsLoading(false);
      return {};
    }
  };

  const loginAsDemo = () => {
    setUser({ id: DEMO_USER.id, email: DEMO_USER.email });
    setProfile(DEMO_USER);
    setIsDemo(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEMO_USER));
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setIsDemo(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
    setIsLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !user) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (isSupabaseConfigured && !isDemo) {
      await supabase.from('profiles').upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isDemo,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
