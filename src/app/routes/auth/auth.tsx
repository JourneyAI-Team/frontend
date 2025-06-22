import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthDialog } from "@/features/auth-v2/components/auth-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useListAccounts } from "@/features/chat/api/list-accounts";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authState } = useAuth();
  const { data: accounts } = useListAccounts({
    queryConfig: {
      enabled: isAuthenticated,
    },
  });

  useEffect(() => {
    // If user is authenticated and has no accounts, redirect to account first setup
    if (isAuthenticated && accounts?.length === 0) {
      navigate("/setup");
      // If user is authenticated and has accounts, redirect to the chat page
    } else if (isAuthenticated && accounts?.length && accounts.length > 0) {
      navigate(`/a/${accounts[0].id}`);
    }
  }, [isAuthenticated, accounts]);

  return (
    <div className="">
      <AuthDialog
        isOpen={!isAuthenticated && authState === "unauthenticated"}
      />
    </div>
  );
};
