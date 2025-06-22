import { api } from "@/libs/axios";
import { type MutationConfig } from "@/libs/react-query";
import type { ProfileRead } from "@/types/api";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

/**
 * Input schema for updating profile during registration
 */
export const updateProfileInput = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  nickname: z.string().min(1, "Nickname is required"),
});

/**
 * Input type for updating profile during registration
 */
export type UpdateProfileData = z.infer<typeof updateProfileInput> & {
  access_token: string;
};

/**
 * API call to update profile during registration
 */
export const updateProfileApi = (
  data: UpdateProfileData
): Promise<ProfileRead> =>
  api.patch("/profile", data, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });

/**
 * Config for useUpdateProfile mutation
 */
type UseUpdateProfileMutationConfig = {
  mutationConfig?: MutationConfig<typeof updateProfileApi>;
};

/**
 * Mutation hook to update profile during registration
 */
export const useUpdateProfile = ({
  mutationConfig,
}: UseUpdateProfileMutationConfig) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
