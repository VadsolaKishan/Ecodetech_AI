import React, { createContext, useContext, useState } from "react";
import { User } from "../types";
import { UserRole, isReadOnlyRole } from "../types/roles";
import { authApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isReadOnly: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("carbon_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("carbon_token"));

  const role: UserRole = (user?.role?.toUpperCase() as UserRole) || "FACTORY_OWNER";
  const isAuthenticated = !!token && !!user;
  const isReadOnly = isReadOnlyRole(role);

  const refreshUser = async () => {
    try {
      if (token) {
        const me = await authApi.getMe();
        setUser(me);
        localStorage.setItem("carbon_user", JSON.stringify(me));
      }
    } catch (err) {
      console.error("Failed to refresh user profile", err);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.data?.user) {
      setUser(res.data.user);
      setToken(res.data.token);
    }
    return res;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isReadOnly,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
