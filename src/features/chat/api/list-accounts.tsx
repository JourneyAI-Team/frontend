import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/libs/axios";
import { type QueryConfig } from "@/libs/react-query";
import type { Account } from "@/types/models";

export type ListAccountsResponse = (Account & { id: string })[];

export const listAccounts = (): Promise<ListAccountsResponse> => {
  return api.get("/account");
};

export const listAccountsQueryOptions = () => {
  return queryOptions({
    queryKey: ["accounts"],
    queryFn: () => listAccounts(),
  });
};

type UseListAccountsOptions = {
  queryConfig?: QueryConfig<typeof listAccountsQueryOptions>;
};

export const useListAccounts = ({ queryConfig }: UseListAccountsOptions) => {
  return useQuery({
    ...listAccountsQueryOptions(),
    ...queryConfig,
  });
};
