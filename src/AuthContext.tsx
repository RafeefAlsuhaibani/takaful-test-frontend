import React, { createContext, useContext, useEffect, useState } from "react";
import { me as apiMe, signin as apiSignin, signup as apiSignup, signout as apiSignout } from "../auth";

type User = any | null;

type AuthCtx = {
  user: User;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  signout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const u = await apiMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("access")) { setLoading(false); return; }
    refreshMe().finally(() => setLoading(false));
  }, []);

  const signin = async (email: string, password: string) => {
    await apiSignin(email, password);
    await refreshMe();
  };

  const signup = async (payload: any) => {
    await apiSignup(payload);
    await refreshMe();
  };

  const signout = async () => {
    await apiSignout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, signin, signup, signout, refreshMe }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
