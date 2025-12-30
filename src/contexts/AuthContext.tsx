import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// AuthContext provides a single source of truth for session and user.
// It ensures the session is initialized before any children render.
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent duplicate auto-refresh timers (can happen during remounts/HMR) by owning the lifecycle here.
  const didInit = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Ensure there is only ever ONE refresh loop running.
    supabase.auth.stopAutoRefresh();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // Ignore INITIAL_SESSION until our explicit getSession resolves.
      if (!didInit.current && event === 'INITIAL_SESSION') return;

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        didInit.current = true;
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Start refresh loop only after we have a definitive session state.
        supabase.auth.startAutoRefresh();
      })
      .catch(() => {
        // If anything goes wrong, fail closed (locked state), but don't spam refresh.
        if (!isMounted) return;
        didInit.current = true;
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
      supabase.auth.stopAutoRefresh();
    };
  }, []);


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}