// import { queryOptions, useQuery } from "@tanstack/react-query";

// import { api } from "@/libs/axios";
// import { type QueryConfig } from "@/libs/react-query";
// import type { Account } from "@/types/api";

// export const getAccounts = (): Promise<Account[]> => {
//   return api.get(`/account`);
// };

// export const getAccountsQueryOptions = () => {
//   return queryOptions({
//     queryKey: ["accounts"],
//     queryFn: () => getAccounts(),
//   });
// };

// type UseAccountsOptions = {
//   queryConfig?: QueryConfig<typeof getAccountsQueryOptions>;
// };

// export const useAccounts = ({ queryConfig }: UseAccountsOptions) => {
//   return useQuery({
//     ...getAccountsQueryOptions(),
//     ...queryConfig,
//   });
// };
