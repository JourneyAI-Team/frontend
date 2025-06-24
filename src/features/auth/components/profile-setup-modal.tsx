// import { Form } from "@/components/ui/react-hook-form-wrapper";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { updateProfileInput, type UpdateProfileData } from "../api/profile";
// import { resolveAxiosError } from "@/utils/resolve-error";
// import { api } from "@/libs/axios";
// import type { User } from "@/types/api";
// import { useMutation } from "@tanstack/react-query";

// interface ProfileSetupModalProps {
//   isOpen: boolean;
//   onSuccess: (userData: any) => void;
//   registrationToken: string | null;
// }

// // Custom API call that uses the registration token directly
// const updateProfileWithToken = async (
//   data: UpdateProfileData,
//   token: string
// ): Promise<User> => {
//   return api.patch("/profile", data, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// export const ProfileSetupModal = ({
//   isOpen,
//   onSuccess,
//   registrationToken,
// }: ProfileSetupModalProps) => {
//   const [errorMessage, setErrorMessage] = useState<string | undefined>(
//     undefined
//   );

//   const updateProfileMutation = useMutation({
//     mutationFn: (data: UpdateProfileData) => {
//       if (!registrationToken) {
//         throw new Error("No registration token available");
//       }
//       return updateProfileWithToken(data, registrationToken);
//     },
//     onSuccess: (data) => {
//       console.log("Profile setup successful:", data);
//       setErrorMessage(undefined);
//       onSuccess(data);
//     },
//     onError: (error) => {
//       const errMessage = resolveAxiosError(error);
//       setErrorMessage(errMessage);
//     },
//   });

//   const handleSubmit = (values: UpdateProfileData) => {
//     updateProfileMutation.mutate(values);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={undefined}>
//       <DialogContent
//         className="sm:max-w-md"
//         showCloseButton={false}
//         onPointerDownOutside={(e) => e.preventDefault()}
//         onEscapeKeyDown={(e) => e.preventDefault()}
//       >
//         <DialogHeader>
//           <DialogTitle>How should we call you?</DialogTitle>
//           <DialogDescription>
//             Let's set up your profile to personalize your Journey AI experience.
//           </DialogDescription>
//         </DialogHeader>

//         {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

//         <Form
//           onSubmit={handleSubmit}
//           schema={updateProfileInput}
//           options={{
//             defaultValues: {
//               first_name: "",
//               last_name: "",
//               nickname: "",
//             },
//           }}
//         >
//           {({ control }) => (
//             <div className="space-y-4">
//               <FormField
//                 control={control}
//                 name="first_name"
//                 render={({ field, fieldState: { error } }) => (
//                   <FormItem>
//                     <FormLabel>First Name *</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Enter your first name"
//                         {...field}
//                         disabled={updateProfileMutation.isPending}
//                       />
//                     </FormControl>
//                     {error?.message && (
//                       <FormDescription className="text-red-500">
//                         {error.message}
//                       </FormDescription>
//                     )}
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={control}
//                 name="last_name"
//                 render={({ field, fieldState: { error } }) => (
//                   <FormItem>
//                     <FormLabel>Last Name *</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Enter your last name"
//                         {...field}
//                         disabled={updateProfileMutation.isPending}
//                       />
//                     </FormControl>
//                     {error?.message && (
//                       <FormDescription className="text-red-500">
//                         {error.message}
//                       </FormDescription>
//                     )}
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={control}
//                 name="nickname"
//                 render={({ field, fieldState: { error } }) => (
//                   <FormItem>
//                     <FormLabel>Nickname *</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="What should we call you?"
//                         {...field}
//                         disabled={updateProfileMutation.isPending}
//                       />
//                     </FormControl>
//                     {error?.message && (
//                       <FormDescription className="text-red-500">
//                         {error.message}
//                       </FormDescription>
//                     )}
//                   </FormItem>
//                 )}
//               />

//               <div className="pt-4">
//                 <Button
//                   type="submit"
//                   disabled={updateProfileMutation.isPending}
//                   className="w-full"
//                 >
//                   {updateProfileMutation.isPending
//                     ? "Setting up profile..."
//                     : "Complete Setup & Continue"}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };
