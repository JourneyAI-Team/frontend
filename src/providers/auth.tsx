import { createContext, useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ACCESS_TOKEN_KEY, API_KEY } from "@/utils/vars";
import { useUser } from "@/libs/auth";
import type { AuthTokens } from "@/types/api";
import type { User } from "@/types/models";

type AuthUserContext = {
  user: User | null;
  accessToken: string | null;
  apiKey: string | null;
  authState: "loading" | "authenticated" | "unauthenticated";
  handleSetAuthTokens: (tokens: AuthTokens | null) => void;
  handleSaveAuthTokens: (tokens: AuthTokens | null) => void;
  handleSetUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthUserContext | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );
  const [apiKey, setApiKey] = useState<string | null>(() =>
    localStorage.getItem(API_KEY)
  );
  const [authState, setAuthState] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const { data, status } = useUser(accessToken);

  const handleSetAuthTokens = (tokens: AuthTokens | null) => {
    if (tokens) {
      setAccessToken(tokens.access_token);
      setApiKey(tokens.api_key);
    } else {
      setAccessToken(null);
      setApiKey(null);
    }
  };

  const handleSaveAuthTokens = (tokens: AuthTokens | null) => {
    if (tokens) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
      localStorage.setItem(API_KEY, tokens.api_key);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(API_KEY);
    }
  };

  const handleSetUser = (user: User | null) => {
    setUser(user);
  };

  // invalidate user query if we have tokens on mount
  useEffect(() => {
    if (accessToken && apiKey) {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    }
  }, []);

  // set auth state based on the status of the user query and tokens
  useEffect(() => {
    // If no tokens, set unauthenticated
    if (!accessToken || !apiKey) {
      setAuthState("unauthenticated");
      return;
    }

    // If we have tokens, check query status
    if (status === "pending") {
      setAuthState("loading");
    } else if (status === "success") {
      if (data) {
        setUser(data);
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
      }
    } else if (status === "error") {
      setAuthState("unauthenticated");
    }
  }, [status, accessToken, apiKey, data]);

  const logout = () => {
    setUser(null);
    handleSetAuthTokens(null);
    handleSaveAuthTokens(null);
  };

  const authValues = useMemo(
    () => ({
      user,
      accessToken,
      apiKey,
      authState,
      handleSetAuthTokens,
      handleSaveAuthTokens,
      handleSetUser,
      logout,
      isAuthenticated: !!user && !!accessToken && !!apiKey,
    }),
    [user, accessToken, apiKey, authState]
  );

  return (
    <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
  );
};
