// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { LoginForm } from "@/features/login/components/login-form";
// import { RegisterForm } from "./register-form";
// import { ProfileSetupModal } from "./profile-setup-modal";
// import { useAuth } from "@/hooks/use-user";

// import journeyAILogoFull from "@/assets/logo/JourneyAI-Logo-Full.svg";

// interface AuthDialogProps {
//   isOpen: boolean;
// }

// type AuthStep = "login" | "register" | "profile-setup";

// export const AuthDialog = ({ isOpen }: AuthDialogProps) => {
//   const [currentStep, setCurrentStep] = useState<AuthStep>("login");
//   const [registrationToken, setRegistrationToken] = useState<string | null>(
//     null
//   );
//   const [registrationApiKey, setRegistrationApiKey] = useState<string | null>(
//     null
//   );
//   const { setToken, setUser } = useAuth();

//   const handleLoginSuccess = (data: any) => {
//     setToken(data.access_token, data.api_key);
//     // Login flow is complete, AuthLoader will handle user data
//   };

//   const handleRegisterSuccess = (data: any) => {
//     // Store the token temporarily but DON'T set it in auth context yet
//     // This prevents AuthLoader from triggering and causing redirects
//     setRegistrationToken(data.access_token);
//     setRegistrationApiKey(data.api_key);
//     setCurrentStep("profile-setup");
//   };

//   const handleProfileSetupSuccess = (userData: any) => {
//     // Now that profile is complete, set both token and user data
//     if (registrationToken && registrationApiKey) {
//       setToken(registrationToken, registrationApiKey);
//     }
//     setUser(userData);
//     setRegistrationToken(null);
//     // Auth flow is complete
//   };

//   const isProfileSetup = currentStep === "profile-setup";

//   return (
//     <>
//       <Dialog open={isOpen && !isProfileSetup}>
//         <DialogContent className="w-sm max-w-sm" showCloseButton={false}>
//           <DialogHeader className="text-center items-center">
//             <img src={journeyAILogoFull} width={120} />
//             <DialogDescription className="text-2xl font-mabry-pro-bold text-center text-black">
//               {currentStep === "login"
//                 ? "Welcome back to Journey."
//                 : "Join Journey AI today."}
//             </DialogDescription>
//           </DialogHeader>

//           {currentStep === "login" ? (
//             <LoginForm onSuccess={handleLoginSuccess} />
//           ) : (
//             <RegisterForm onSuccess={handleRegisterSuccess} />
//           )}

//           <div className="text-center text-sm text-gray-600">
//             {currentStep === "login" ? (
//               <>
//                 Don't have an account?{" "}
//                 <Button
//                   variant="link"
//                   className="p-0 h-auto text-sm"
//                   onClick={() => setCurrentStep("register")}
//                 >
//                   Sign up
//                 </Button>
//               </>
//             ) : (
//               <>
//                 Already have an account?{" "}
//                 <Button
//                   variant="link"
//                   className="p-0 h-auto text-sm"
//                   onClick={() => setCurrentStep("login")}
//                 >
//                   Sign in
//                 </Button>
//               </>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       <ProfileSetupModal
//         isOpen={isProfileSetup}
//         onSuccess={handleProfileSetupSuccess}
//         registrationToken={registrationToken}
//       />
//     </>
//   );
// };
