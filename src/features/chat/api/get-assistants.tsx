import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";
import type { Assistant } from "@/types/models";

type GetAssistantsParams = {
  category?: string;
  ids?: string[];
};

export const getAssistants = (params: GetAssistantsParams) => {
  return api.get("/assistant", { params });
};

export const getAssistantsQueryOptions = (params?: GetAssistantsParams) => {
  return queryOptions({
    queryKey: ["assistants", params?.category || "all"],
    queryFn: () => getAssistants(params),
  });
};

type UseAssistantsOptions = {
  queryParams?: GetAssistantsParams;
  queryConfig?: QueryConfig<typeof getAssistantsQueryOptions>;
};

export const useAssistants = ({
  queryParams,
  queryConfig,
}: UseAssistantsOptions = {}) => {
  return useQuery({
    ...getAssistantsQueryOptions(queryParams),
    ...queryConfig,
  });
};
