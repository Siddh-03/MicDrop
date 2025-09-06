import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// TypeScript Interfaces
interface UserData {
  _id: string;
  username: string;
  email:string;
}

interface AuthState {
  status: "loading" | "authenticated" | "unauthenticated";
  user: UserData | null;
}

interface AuthContextType {
  authState: AuthState;
  login: () => void; // Changed: No longer takes an argument
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    status: "loading",
    user: null,
  });

  // This is the single function responsible for checking the user's status
  const verifyUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Token verification failed.");
      }

      const userData = await response.json();
      setAuthState({ status: "authenticated", user: userData });
    } catch (error) {
      console.warn("User is not authenticated:", (error as Error).message);
      setAuthState({ status: "unauthenticated", user: null });
    }
  };

  // Run the verification check when the app loads
  useEffect(() => {
    verifyUser();
  }, []);

  // The login function now simply triggers a re-verification
  const login = () => {
    verifyUser();
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setAuthState({ status: "unauthenticated", user: null });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};