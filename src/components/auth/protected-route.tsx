import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // redirect to login page if user is not authenticated
    if (authState === "unauthenticated") {
      navigate("/");
    }
  }, [authState]);

  // if user is authenticated, show the children
  if (authState === "authenticated") {
    return <>{children}</>;
  }

  // loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
