// import { api } from "@/libs/axios";
// import { type MutationConfig } from "@/libs/react-query";
// import type { User } from "@/types/api";

// import { useMutation } from "@tanstack/react-query";
// import { z } from "zod";

// export const updateProfileInput = z.object({
//   first_name: z.string().min(1, "First name is required"),
//   last_name: z.string().min(1, "Last name is required"),
//   nickname: z.string().min(1, "Nickname is required"),
// });

// export type UpdateProfileData = z.infer<typeof updateProfileInput>;

// export const updateProfileApi = (data: UpdateProfileData): Promise<User> =>
//   api.patch("/profile", data);

// type UseUpdateProfileMutationConfig = {
//   mutationConfig?: MutationConfig<typeof updateProfileApi>;
// };

// export const useUpdateProfile = ({
//   mutationConfig,
// }: UseUpdateProfileMutationConfig) => {
//   const { onSuccess, ...restConfig } = mutationConfig || {};

//   return useMutation({
//     mutationFn: updateProfileApi,
//     onSuccess: (...args) => {
//       onSuccess?.(...args);
//     },
//     ...restConfig,
//   });
// };
