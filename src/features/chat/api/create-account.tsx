import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "@/libs/axios";
import { type MutationConfig } from "@/libs/react-query";
import type { Account } from "@/types/models";

export const createAccountInput = z.object({
  name: z.string().min(1, "Account name is required"),
  description: z.string().min(1, "Account description is required"),
});

export type CreateAccountData = z.infer<typeof createAccountInput>;

export const createAccountApi = (data: CreateAccountData): Promise<Account> =>
  api.post("/account", data);

type UseCreateAccountMutationConfig = {
  mutationConfig?: MutationConfig<typeof createAccountApi>;
};

export const useCreateAccount = ({
  mutationConfig,
}: UseCreateAccountMutationConfig) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createAccountApi,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
