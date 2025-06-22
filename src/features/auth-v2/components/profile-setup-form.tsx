import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/react-hook-form-wrapper";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resolveAxiosError } from "@/utils/resolve-error";
import {
  updateProfileInput,
  useUpdateProfile,
  type UpdateProfileData,
} from "../api/profile-update";
import { useState } from "react";
import type { AuthTokens } from "@/types/api";

export const ProfileSetupForm = ({
  onSuccess,
  registrationTokens,
}: {
  onSuccess: () => void;
  registrationTokens: AuthTokens | null;
}) => {
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const updateProfileMutation = useUpdateProfile({
    mutationConfig: {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        const errMessage = resolveAxiosError(error);
        setErrorMessage(errMessage);
      },
    },
  });
  const handleSubmit = (formValues: UpdateProfileData) => {
    setErrorMessage(null);
    if (registrationTokens) {
      updateProfileMutation.mutate({
        ...formValues,
        access_token: registrationTokens.access_token,
      });
    }
  };
  return (
    <>
      {errorMessage && (
        <Alert className="mb-5" variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Form
        onSubmit={handleSubmit}
        schema={updateProfileInput}
        options={{
          defaultValues: {
            first_name: "",
            last_name: "",
            nickname: "",
          },
        }}
      >
        {({ control }) => (
          <div className="space-y-4">
            <FormField
              control={control}
              name="first_name"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name"
                      {...field}
                      disabled={updateProfileMutation.isPending}
                    />
                  </FormControl>
                  {error?.message && (
                    <FormDescription className="text-red-500">
                      {error.message}
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="last_name"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your last name"
                      {...field}
                      disabled={updateProfileMutation.isPending}
                    />
                  </FormControl>
                  {error?.message && (
                    <FormDescription className="text-red-500">
                      {error.message}
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="nickname"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What should we call you?"
                      {...field}
                      disabled={updateProfileMutation.isPending}
                    />
                  </FormControl>
                  {error?.message && (
                    <FormDescription className="text-red-500">
                      {error.message}
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending
                  ? "Setting up profile..."
                  : "Complete Setup & Continue"}
              </Button>
            </div>
          </div>
        )}
      </Form>
    </>
  );
};
