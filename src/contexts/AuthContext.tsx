import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, setToken } from '@/lib/api';

type AppRole = 'admin' | 'student';
type User = { id: string; email: string };

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  profile: { username: string; avatar_url: string | null } | null;
  loading: boolean;
  setAuthData: (token: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, role: null, profile: null, loading: true,
  setAuthData: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const loadMe = async () => {
    const { user: me } = await api.me();
    setUser({ id: me.id, email: me.email });
    setRole(me.role);
    setProfile({ username: me.username, avatar_url: me.avatar_url ?? null });
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await loadMe();
      } catch {
        setToken(null);
        setUser(null);
        setRole(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);
  const setAuthData = async (token: string, userData?: any) => {
    setToken(token);
    if (userData) {
      setUser({ id: userData.id, email: userData.email });
      setRole(userData.role);
      setProfile({ username: userData.username, avatar_url: userData.avatar_url ?? null });
      return;
    }
    await loadMe();
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, setAuthData, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
