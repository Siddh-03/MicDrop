import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

// Define the shape of the user data we expect from the backend
interface UserData {
  _id: string;
  username: string;
  email: string;
}

// Define the shape of our authentication state, now with a loading status
interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: UserData | null;
}

// Define the shape of the context's value
interface AuthContextType {
  authState: AuthState;
  login: (userData: UserData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // The app starts in a 'loading' state until we verify the user
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading', user: null });

  // This effect runs ONLY ONCE when the app starts.
  // Its job is to check with the backend if a valid cookie exists.
  useEffect(() => {
    const verifyUser = async () => {
      try {
        // We don't check for a cookie here. We just ask the backend.
        // The browser will automatically send the httpOnly cookie.
        const response = await fetch("http://localhost:3000/api/me", { credentials: 'include' });
        
        if (!response.ok) {
          // If the backend says the cookie is invalid or not there, we are unauthenticated.
          throw new Error("Token verification failed");
        }

        // If the backend responds with user data, we are authenticated.
        const userData = await response.json();
        setAuthState({ status: 'authenticated', user: userData });
      } catch (error) {
        // Any failure in the process means the user is unauthenticated.
        console.error(error);
        Cookies.remove('token'); // Clean up any stray browser-readable cookies
        setAuthState({ status: 'unauthenticated', user: null });
      }
    };
    verifyUser();
  }, []); // The empty array [] ensures this runs only once on initial load

  // This function is called from the Auth page after a successful login API call
  const login = (userData: UserData) => {
    setAuthState({ status: 'authenticated', user: userData });
  };

  // This function is called from the Navbar to log the user out
  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      Cookies.remove('token');
      setAuthState({ status: 'unauthenticated', user: null });
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
