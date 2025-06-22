import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/libs/axios";
import { type MutationConfig } from "@/libs/react-query";
import type { AuthResponse } from "@/types/api";

export const registerInput = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Must match password",
    path: ["confirm_password"],
  });

export type RegisterData = z.infer<typeof registerInput>;

export const registerApi = (data: RegisterData): Promise<AuthResponse> =>
  api.post("/auth/register", data);

type UseRegisterMutationConfig = {
  mutationConfig?: MutationConfig<typeof registerApi>;
};

export const useRegister = ({ mutationConfig }: UseRegisterMutationConfig) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
