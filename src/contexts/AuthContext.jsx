import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";

import { AuthContext } from "./useAuth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getProfile();
          if (active) setUser(response.data.data);
        }
      } catch { if (active) { authService.logout(); setUser(null); } }
      finally { if (active) setLoading(false); }
    };
    checkAuth();
    return () => { active = false; };  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);

    setUser(result.data.user);

    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};
