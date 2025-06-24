// import { Form } from "@/components/ui/react-hook-form-wrapper";
// import { Button } from "@/components/ui/button";

// import {
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
// } from "@/components/ui/form";
// import { useState } from "react";
// import { EyeIcon, EyeClosed } from "lucide-react";
// import { useRegister, registerInput, type RegisterData } from "../api/register";
// import { resolveAxiosError } from "@/utils/resolve-error";
// import { Input } from "@/components/ui/input";

// interface RegisterFormProps {
//   onSuccess: (data: any) => void;
// }

// export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | undefined>(
//     undefined
//   );

//   const registerMutation = useRegister({
//     mutationConfig: {
//       onSuccess: (data) => {
//         console.log("Registration successful:", data);
//         setErrorMessage(undefined);
//         onSuccess(data);
//       },
//       onError: (error) => {
//         const errMessage = resolveAxiosError(error);
//         setErrorMessage(errMessage);
//       },
//     },
//   });

//   const handleSubmit = (values: RegisterData) => {
//     registerMutation.mutate(values);
//   };

//   return (
//     <>
//       {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
//       <Form
//         onSubmit={handleSubmit}
//         schema={registerInput}
//         options={{
//           defaultValues: {
//             email: "",
//             password: "",
//           },
//         }}
//       >
//         {({ control }) => (
//           <>
//             <FormField
//               control={control}
//               name="email"
//               render={({ field, fieldState: { error } }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="Enter your email"
//                       {...field}
//                       disabled={registerMutation.isPending}
//                     />
//                   </FormControl>
//                   {error?.message && (
//                     <FormDescription className="text-red-500">
//                       {error.message}
//                     </FormDescription>
//                   )}
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={control}
//               name="password"
//               render={({ field, fieldState: { error } }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Create a password (min. 6 characters)"
//                       endIcon={
//                         showPassword ? (
//                           <EyeClosed
//                             className="text-muted-foreground cursor-pointer"
//                             onClick={() => setShowPassword(false)}
//                           />
//                         ) : (
//                           <EyeIcon
//                             className="text-muted-foreground cursor-pointer"
//                             onClick={() => setShowPassword(true)}
//                           />
//                         )
//                       }
//                       {...field}
//                       disabled={registerMutation.isPending}
//                     />
//                   </FormControl>
//                   {error?.message && (
//                     <FormDescription className="text-red-500">
//                       {error.message}
//                     </FormDescription>
//                   )}
//                 </FormItem>
//               )}
//             />
//             <div className="grid">
//               <Button type="submit" disabled={registerMutation.isPending}>
//                 {registerMutation.isPending
//                   ? "Creating Account..."
//                   : "Create Account"}
//               </Button>
//             </div>
//           </>
//         )}
//       </Form>
//     </>
//   );
// };
