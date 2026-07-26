"use client";

import cookies from "react-cookies";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { userService } from "@/services/user.service";
import type { UserResponse } from "@/types/auth";

type AuthContextValue = {
  user: UserResponse | null;
  isAuthenticated: boolean;
  ready: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  syncUser: (user: UserResponse) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = cookies.load("token");

      if (!token) {
        if (active) {
          setReady(true);
        }
        return;
      }

      try {
        const currentUser = await userService.getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        cookies.remove("token", {
          path: "/",
        });
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      async signIn(token) {
        cookies.save("token", token, {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24,
        });

        try {
          const currentUser = await userService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          cookies.remove("token", {
            path: "/",
          });
          setUser(null);
          throw error;
        }
      },
      signOut() {
        cookies.remove("token", {
          path: "/",
        });
        setUser(null);
      },
      syncUser(updatedUser) {
        setUser(updatedUser);
      },
    }),
    [ready, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }

  return context;
}
