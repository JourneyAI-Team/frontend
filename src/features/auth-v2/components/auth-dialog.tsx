import { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AuthResponse, AuthTokens } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

import journeyAILogoFull from "@/assets/logo/JourneyAI-Logo-Full.svg";

import { LoginForm } from "./login-form";
import { RegistrationForm } from "./registration-form";
import { ProfileSetupForm } from "./profile-setup-form";
import { useUser } from "@/libs/auth";

type AuthSteps = "login" | "registration" | "profile-setup";

const RenderTitle = ({ step }: { step: AuthSteps }) => {
  if (step === "login") {
    return "Welcome back to Journey";
  } else if (step === "registration") {
    return "Join Journey AI today.";
  }
  return "How should we call you?";
};

const RenderForm = ({
  step,
  registrationTokens,
  onSuccessfulRegistration,
  onSuccessfulProfileSetup,
}: {
  step: AuthSteps;
  registrationTokens: AuthTokens | null;
  onSuccessfulRegistration: (tokens: AuthResponse) => void;
  onSuccessfulProfileSetup: () => void;
}) => {
  if (step === "login") {
    return <LoginForm />;
  } else if (step === "registration") {
    return <RegistrationForm onSuccess={onSuccessfulRegistration} />;
  }
  return (
    <ProfileSetupForm
      onSuccess={onSuccessfulProfileSetup}
      registrationTokens={registrationTokens}
    />
  );
};

const RenderButton = ({
  step,
  handleButtonClick,
}: {
  step: AuthSteps;
  handleButtonClick: (nextStep: AuthSteps) => void;
}) => {
  if (step === "login") {
    return (
      <>
        Don't have an account?{" "}
        <Button
          variant="link"
          className="p-0 h-auto text-sm cursor-pointer"
          onClick={() => handleButtonClick("registration")}
        >
          Sign up
        </Button>
      </>
    );
  } else if (step === "registration") {
    return (
      <>
        Already have an account?{" "}
        <Button
          variant="link"
          className="p-0 h-auto text-sm cursor-pointer"
          onClick={() => handleButtonClick("login")}
        >
          Sign in
        </Button>
      </>
    );
  }
  return <></>;
};

export const AuthDialog = ({ isOpen }: { isOpen: boolean }) => {
  const { handleSetAuthTokens, handleSaveAuthTokens, handleSetUser } =
    useAuth();
  const [currentStep, setCurrentStep] = useState<AuthSteps>("login");
  const [registrationTokens, setRegistrationTokens] =
    useState<AuthTokens | null>(null);

  const { data: user, refetch } = useUser(
    registrationTokens?.access_token ?? null
  );

  const handleSetNextStep = (nextStep: AuthSteps) => {
    setCurrentStep(nextStep);
  };

  const handleRegisterSuccess = (tokens: AuthResponse) => {
    setRegistrationTokens(tokens);
    handleSetNextStep("profile-setup");
  };

  const handleProfileSetupSuccess = () => {
    if (registrationTokens) {
      handleSetAuthTokens(registrationTokens);
      handleSaveAuthTokens(registrationTokens);
      refetch();
    }
  };

  useEffect(() => {
    if (user) {
      handleSetUser(user);
    }
  }, [user]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-sm max-w-sm" showCloseButton={false}>
        <DialogHeader className="text-center items-center">
          <img src={journeyAILogoFull} alt="Journey AI Logo" width={120} />
          <DialogTitle className="text-2xl font-bold">
            <RenderTitle step={currentStep} />
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="mt-3">
          <RenderForm
            step={currentStep}
            registrationTokens={registrationTokens}
            onSuccessfulRegistration={handleRegisterSuccess}
            onSuccessfulProfileSetup={handleProfileSetupSuccess}
          />
        </div>
        <div className="text-center text-sm text-gray-600">
          <RenderButton
            step={currentStep}
            handleButtonClick={handleSetNextStep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
