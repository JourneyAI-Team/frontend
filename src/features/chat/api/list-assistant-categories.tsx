import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";

export type ListAssistantCategoriesResponse = {
  assistant_categories: string[];
};

export const listAssistantCategories =
  (): Promise<ListAssistantCategoriesResponse> => {
    return api.get("/assistant/categories");
  };

export const listAssistantCategoriesQueryOptions = () => {
  return queryOptions({
    queryKey: ["assistants", "categories"],
    queryFn: () => listAssistantCategories(),
  });
};

type UseListAssistantCategoriesOptions = {
  queryConfig?: QueryConfig<typeof listAssistantCategoriesQueryOptions>;
};

export const useListAssistantCategories = ({
  queryConfig,
}: UseListAssistantCategoriesOptions = {}) => {
  return useQuery({
    ...listAssistantCategoriesQueryOptions(),
    ...queryConfig,
  });
};
