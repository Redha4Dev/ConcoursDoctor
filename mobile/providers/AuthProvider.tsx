import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import api from "../utils/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children } : any) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = await SecureStore.getItemAsync("token");
      const userString = await SecureStore.getItemAsync("user");
      if (token && userString) {
        setUser(JSON.parse(userString));
      }
      setLoading(false);
    };
    loadUserFromStorage();
  }, []);

  // --- LOGIN FUNCTION (This is now called by register) ---
const login = async (email, password) => {
  const res = await api.post("/api/v1/auth/login", { email, password });

  const token = res.data.data.token;
  const user = res.data.data.user;

  if (token && user) {
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));

    setUser(user);
  } else {
    throw new Error("Invalid response from server");
  }
};


  // --- REGISTER FUNCTION (Now calls login) ---
//   const register = async (userData) => {
//     const apiPayload = {
//       username: userData.username,
//       email: userData.email,
//       password: userData.password,
//       confirmPassword: userData.confirmPassword,
//       role: userData.role,
//     };

//     // Step 1: Register the user. We expect a success message, not a token.
//     await api.post("/register", apiPayload);

    // Step 2: Immediately log the user in to get the token.
    // This assumes your /login endpoint is working and returns a token and user object.
  //  await login(userData.email, userData.password);
//  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setUser(null);
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login,  logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}



export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // 1. Wait until navigation is fully ready and user loading is complete.
    if (!navigationState?.key || loading) {
      return;
    }

    //const inAuthGroup = segments[0] === '(auth)';
    
    // --- THIS IS THE KEY CHANGE ---
    // We need to know if the user is in ANY of the protected tab groups.
    //const inApp = segments[0] === '(farmer)' || segments[0] === '(buyer)';
    // Add other roles here, e.g., || segments[0] === '(supplier)'
    // ----------------------------

    // if (!user && !inAuthGroup) {
    //   // If the user is not signed in and is trying to access anything
    //   // other than the auth pages, redirect to login.
    //   router.replace('/(auth)/login');
    // } else if (user /* && !inApp */) {
    //   // If the user IS signed in but is currently on a page
    //   // that is NOT a protected app page (e.g., they are on the login page),
    //   // redirect them to their correct home.
    //   //router.replace(`/${user.role === 'farmer' ? '(farmer)' : '(supplier)'}`); // Add more roles here
    // }
  }, [user, segments, navigationState, loading, router]);
}