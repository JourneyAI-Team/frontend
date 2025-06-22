import { useState } from "react";
import { AlertCircleIcon, EyeClosed, EyeIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/react-hook-form-wrapper";
import { useAuth } from "@/hooks/use-auth";
import { resolveAxiosError } from "@/utils/resolve-error";

import { useLogin, loginInput, type LoginData } from "../api/login";

export const LoginForm = () => {
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const loginMutation = useLogin({
    mutationConfig: {
      onSuccess: (data) => {
        console.log("Login successful:", data);
        auth.handleSetAuthTokens(data);
        auth.handleSaveAuthTokens(data);
      },
      onError: (error) => {
        const errMessage = resolveAxiosError(error);
        console.log("Login error:", error);
        setErrorMessage(errMessage);
      },
    },
  });

  const handleSubmit = (formValues: LoginData) => {
    setErrorMessage(null);
    const formData = new FormData();
    formData.append("username", formValues.username);
    formData.append("password", formValues.password);
    loginMutation.mutate(formData);
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
        schema={loginInput}
        options={{
          defaultValues: {
            username: "",
            password: "",
          },
        }}
      >
        {({ control }) => (
          <>
            <FormField
              control={control}
              name="username"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      {...field}
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
                      placeholder="Enter your password"
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
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </>
        )}
      </Form>
    </>
  );
};
