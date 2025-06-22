import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/libs/axios";
import { type MutationConfig } from "@/libs/react-query";
import type { Profile } from "@/types/models";

type FavoriteAssistantData = {
  favorite_assistants: string[];
};

export const favoriteAssistantApi = (
  data: FavoriteAssistantData
): Promise<Profile> => api.patch("/profile", data);

type UseFavoriteAssistantMutationConfig = {
  mutationConfig?: MutationConfig<typeof favoriteAssistantApi>;
};

export const useFavoriteAssistant = ({
  mutationConfig,
}: UseFavoriteAssistantMutationConfig) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: favoriteAssistantApi,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
