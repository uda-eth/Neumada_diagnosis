import { createContext, useContext, ReactNode } from "react";
import { useUser as useUserHook } from "@/hooks/use-user";

// Re-export the useUser hook directly
export { useUser } from "@/hooks/use-user";

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // We're using the useUser hook implementation
  // This component now just wraps the app to provide global user state
  return (
    <>{children}</>
  );
}
