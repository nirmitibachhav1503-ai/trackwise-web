import {
  createContext,
  useContext,
  useState
} from "react";

import type { ReactNode } from "react";

import type { User } from "../types/user";

interface AuthContextType {

  user: User | null;

  token: string | null;

  login: (
    token: string,
    user: User
  ) => void;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export const AuthProvider = ({
  children
}: {
  children: ReactNode;
}) =>
{
  const [user, setUser] =
    useState<User | null>(
      JSON.parse(
        localStorage.getItem("user")
        || "null"
      )
    );

  const [token, setToken] =
    useState<string | null>(
      localStorage.getItem("token")
    );

  const login = (
    token: string,
    user: User
  ) =>
  {
    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setToken(token);

    setUser(user);
  };

  const logout = () =>
  {
    localStorage.clear();

    setUser(null);

    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);