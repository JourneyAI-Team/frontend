import { useQuery } from "@tanstack/react-query";
import { api } from "./axios";
import type { User } from "@/types/models";

export type UserRead = User & { id: string };

const verifyUserAuth = (token: string): Promise<UserRead> => {
  return api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const useUser = (token: string | null) =>
  useQuery({
    queryKey: ["user", token],
    queryFn: () => verifyUserAuth(token!),
    enabled: !!token,
  });
