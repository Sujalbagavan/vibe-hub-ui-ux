
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';
import { getUserProfile } from '@/services/supabaseService';
import { mapUserFromSupabase } from '@/utils/dataMappers';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(async () => {
            try {
              const profile = await getUserProfile(newSession.user.id);
              setUser(mapUserFromSupabase(newSession.user.id, profile));
            } catch (error) {
              console.error('Failed to get user profile:', error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user) {
          try {
            const profile = await getUserProfile(initialSession.user.id);
            setUser(mapUserFromSupabase(initialSession.user.id, profile));
          } catch (error) {
            console.error('Failed to get user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to initialize authentication',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Login Failed',
        description: 'There was a problem signing in with Google',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign Out Failed',
        description: 'There was a problem signing out',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
