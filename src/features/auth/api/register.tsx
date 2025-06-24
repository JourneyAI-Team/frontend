// import { api } from "@/libs/axios";
// import { type MutationConfig } from "@/libs/react-query";
// import type { Login } from "@/types/api";

// import { useMutation } from "@tanstack/react-query";
// import { z } from "zod";

// export const registerInput = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// export type RegisterData = z.infer<typeof registerInput>;

// export const registerApi = (data: RegisterData): Promise<Login> =>
//   api.post("/auth/register", data);

// type UseRegisterMutationConfig = {
//   mutationConfig?: MutationConfig<typeof registerApi>;
// };

// export const useRegister = ({ mutationConfig }: UseRegisterMutationConfig) => {
//   const { onSuccess, ...restConfig } = mutationConfig || {};

//   return useMutation({
//     mutationFn: registerApi,
//     onSuccess: (...args) => {
//       onSuccess?.(...args);
//     },
//     ...restConfig,
//   });
// };
