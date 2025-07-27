import { Asset, Profile, User } from '../types';

// Chaves para o localStorage
const STORAGE_KEYS = {
  USER: 'auth_user',
  PROFILE: 'user_profile',
  ASSETS: 'user_assets',
} as const;

// Funções auxiliares para localStorage
const getItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const removeItem = (key: string): void => {
  localStorage.removeItem(key);
};

// Gerenciamento de usuário
export const getStoredUser = (): User | null => getItem(STORAGE_KEYS.USER);
export const setStoredUser = (user: User): void => setItem(STORAGE_KEYS.USER, user);
export const removeStoredUser = (): void => removeItem(STORAGE_KEYS.USER);

// Gerenciamento de perfil
export const getStoredProfile = (): Profile | null => getItem(STORAGE_KEYS.PROFILE);
export const setStoredProfile = (profile: Profile): void => setItem(STORAGE_KEYS.PROFILE, profile);
export const removeStoredProfile = (): void => removeItem(STORAGE_KEYS.PROFILE);

// Gerenciamento de assets
export const getStoredAssets = (): Asset[] => getItem(STORAGE_KEYS.ASSETS) || [];
export const setStoredAssets = (assets: Asset[]): void => setItem(STORAGE_KEYS.ASSETS, assets);
export const removeStoredAssets = (): void => removeItem(STORAGE_KEYS.ASSETS);

// Função para limpar todos os dados
export const clearStorage = (): void => {
  removeStoredUser();
  removeStoredProfile();
  removeStoredAssets();
};