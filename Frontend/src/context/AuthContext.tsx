import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

interface UserData {
  _id: string;
  username: string;
  email: string;
}

interface AuthState {
  status: "loading" | "authenticated" | "unauthenticated";
  user: UserData | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (userData: UserData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // The app starts in a 'loading' state until we verify the user
  const [authState, setAuthState] = useState<AuthState>({
    status: "loading",
    user: null,
  });

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Token verification failed. User is not logged in.");
        }

        const userData = await response.json();
        setAuthState({ status: "authenticated", user: userData });
      } catch (error) {
        console.warn("User is not authenticated:", (error as Error).message);
        Cookies.remove("token"); 
        setAuthState({ status: "unauthenticated", user: null });
      }
    };
    verifyUser();
  }, []); 

  const login = (userData: UserData) => {
    setAuthState({ status: "authenticated", user: userData });
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      Cookies.remove("token");
      setAuthState({ status: "unauthenticated", user: null });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
