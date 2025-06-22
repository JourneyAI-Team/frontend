// NOTE: Account is now called Workspace, all user facing text has been updated to use Workspace
// but the components, api, etc remain to use Account.
import { Form } from "@/components/ui/react-hook-form-wrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { useState } from "react";
import {
  useCreateAccount,
  createAccountInput,
  type CreateAccountData,
} from "../api/create-account";
import { resolveAxiosError } from "@/utils/resolve-error";
import { useQueryClient } from "@tanstack/react-query";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: any) => void;
  isForced?: boolean;
}

export const CreateAccountModal = ({
  isOpen,
  onClose,
  onSuccess,
  isForced = false,
}: CreateAccountModalProps) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createAccountMutation = useCreateAccount({
    mutationConfig: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        onSuccess?.(data);
        onClose();
        setErrorMessage(null);
      },
      onError: (error) => {
        const errMessage = resolveAxiosError(error);
        setErrorMessage(errMessage);
      },
    },
  });

  const handleSubmit = (values: CreateAccountData) => {
    createAccountMutation.mutate(values);
  };

  const handleClose = () => {
    if (!isForced && !createAccountMutation.isPending) {
      setErrorMessage(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isForced ? undefined : handleClose}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={!isForced && !createAccountMutation.isPending}
        onPointerDownOutside={isForced ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isForced ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {isForced ? "Create Your First Workspace" : "Create New Workspace"}
          </DialogTitle>
          <DialogDescription>
            {isForced
              ? "To get started with Journey AI, you need to create your first client workspace."
              : "Create a new client workspace to organize your conversations and data."}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

        <Form
          onSubmit={handleSubmit}
          schema={createAccountInput}
          options={{
            defaultValues: {
              name: "",
              description: "",
            },
          }}
        >
          {({ control }) => (
            <div className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter workspace name"
                        {...field}
                        disabled={createAccountMutation.isPending}
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
                name="description"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Enter workspace description"
                        className={cn(
                          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                          createAccountMutation.isPending && "opacity-50"
                        )}
                        {...field}
                        disabled={createAccountMutation.isPending}
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

              <div className="flex gap-3 pt-4">
                {!isForced && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={createAccountMutation.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={createAccountMutation.isPending}
                  className={isForced ? "w-full" : "flex-1"}
                >
                  {createAccountMutation.isPending
                    ? "Creating..."
                    : isForced
                    ? "Create Workspace & Continue"
                    : "Create Workspace"}
                </Button>
              </div>
            </div>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};
