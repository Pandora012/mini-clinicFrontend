import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getUser();
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
