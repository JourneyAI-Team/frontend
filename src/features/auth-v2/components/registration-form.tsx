import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/react-hook-form-wrapper";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resolveAxiosError } from "@/utils/resolve-error";
import { EyeIcon, EyeClosed, AlertCircleIcon } from "lucide-react";
import { useRegister, registerInput, type RegisterData } from "../api/register";
import type { AuthResponse } from "@/types/api";

export const RegistrationForm = ({
  onSuccess,
}: {
  onSuccess: (tokens: AuthResponse) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const registerMutation = useRegister({
    mutationConfig: {
      // data returns AuthToken
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (error) => {
        const errMessage = resolveAxiosError(error);
        setErrorMessage(errMessage);
      },
    },
  });
  const handleSubmit = (formValues: RegisterData) => {
    setErrorMessage(null);
    registerMutation.mutate(formValues);
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
        schema={registerInput}
        options={{
          defaultValues: {
            email: "",
            password: "",
            confirm_password: "",
          },
        }}
      >
        {({ control }) => (
          <>
            <FormField
              control={control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      disabled={registerMutation.isPending}
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
              name="password"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min. 6 characters)"
                      endIcon={
                        showPassword ? (
                          <EyeClosed
                            className="text-muted-foreground cursor-pointer"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <EyeIcon
                            className="text-muted-foreground cursor-pointer"
                            onClick={() => setShowPassword(true)}
                          />
                        )
                      }
                      {...field}
                      disabled={registerMutation.isPending}
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
              name="confirm_password"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password."
                      // endIcon={
                      //   showPassword ? (
                      //     <EyeClosed
                      //       className="text-muted-foreground cursor-pointer"
                      //       onClick={() => setShowPassword(false)}
                      //     />
                      //   ) : (
                      //     <EyeIcon
                      //       className="text-muted-foreground cursor-pointer"
                      //       onClick={() => setShowPassword(true)}
                      //     />
                      //   )
                      // }
                      {...field}
                      disabled={registerMutation.isPending}
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
            <div className="grid">
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </div>
          </>
        )}
      </Form>
    </>
  );
};
