import { type ReactNode } from "react";
import { useFirebaseMessagingInit } from "../../lib/firebase/useFirebaseMessaging";
import { useAuth } from "../../lib/AuthProvider";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, isLoading, token } = useAuth();
  useFirebaseMessagingInit({ isAuthenticated, isLoading, authToken: token });

  return <>{children}</>;
};
