import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { getStoredUser, setStoredUser, removeStoredUser, getStoredProfile, setStoredProfile, removeStoredProfile, clearStorage } from '../lib/storage';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  error: string | null;
  isLinkSent: boolean;
  setIsLinkSent: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [profile, setProfile] = useState<Profile | null>(getStoredProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLinkSent, setIsLinkSent] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      // Simular login
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        created_at: new Date().toISOString(),
      };
      
      const newProfile = {
        id: newUser.id,
        email,
        name: email.split('@')[0],
        structure_name: 'Estrutura Principal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setUser(newUser);
      setProfile(newProfile);
      setStoredUser(newUser);
      setStoredProfile(newProfile);
      setError(null);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login');
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      // Simular cadastro
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        created_at: new Date().toISOString(),
      };
      
      const newProfile = {
        id: newUser.id,
        email,
        name: email.split('@')[0],
        structure_name: 'Estrutura Principal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setUser(newUser);
      setProfile(newProfile);
      setStoredUser(newUser);
      setStoredProfile(newProfile);
      setError(null);
      
    } catch (error) {
      let errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao criar conta';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error('Erro no cadastro:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      // Simular envio de magic link
      setIsLinkSent(true);
      setError(null);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      clearStorage();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao sair');
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error('Nenhum usuário logado');
      const updatedProfile = { ...profile, ...data, updated_at: new Date().toISOString() } as Profile;
      setProfile(updatedProfile);
      setStoredProfile(updatedProfile);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o perfil');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithEmail,
      signUpWithEmail,
      signInWithMagicLink,
      signOut, 
      updateProfile, 
      error,
      isLinkSent,
      setIsLinkSent
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