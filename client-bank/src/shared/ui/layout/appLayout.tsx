import { type ReactNode } from "react";
import { useFirebaseMessagingInit } from "../../lib/firebase/useFirebaseMessaging";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  useFirebaseMessagingInit();

  return <>{children}</>;
};