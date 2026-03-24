import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import api from "./axios"; // Make sure this path is correct

// TypeScript: Define the shape of your context data for better type safety
type AuthContextType = {
  user: object | null;
  loading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
};

// Initialize context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On app start, load the user from storage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = await SecureStore.getItemAsync("token");
      const userString = await SecureStore.getItemAsync("user");

      if (token && userString) {
        // If we have token and user data, we are likely logged in
        setUser(JSON.parse(userString));
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // --- LOGIN FUNCTION ---
  const login = async (email, password) => {
    const res = await api.post("/api/v1/auth/login", { email, password });

    // Assuming your backend response is { data: { token: '...', user: {...} } }
    // Adjust if your structure is different.
    //const token = res.data.data.token;
    //const user = res.data.data.user;
    console.log(res.data);

    // Defensive check to ensure both token and user object exist
    if (token && typeof token === "string" && user && user.role) {
      // Store the session data
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(user));

      // Update the global state
      setUser(user);

      // --- THIS IS THE DYNAMIC REDIRECT LOGIC ---
//       if (user.role === "farmer") {
//         router.replace("/(farmer)");
//       } else if (user.role === "buyer") {
//         router.replace("/(supplier)");
//       } else {
//         // Fallback: If role is unknown or missing, log out to be safe
//         console.warn(`Unknown user role: ${user.role}. Logging out.`);
//         // You might want to call your logout function here or redirect to a generic error page
//         router.replace("/(auth)/login");
//       }
//       // ------------------------------------------
//     } else {
//       // This error is thrown if the server's response is missing token, user, or role.
//       throw new Error("Login failed: Invalid or incomplete data from server.");
//     }
//   };

  

    
    // After a successful API call, get the token and user
    const token = res.data.token;
    console.log(token);
    const user = res.data.user;

    // Defensive Check: Ensure the token exists and is a string before saving
    if (token && typeof token === "string" && user) {
      await SecureStore.setItemAsync("token", token);
      // Stringify the user object before saving
      await SecureStore.setItemAsync("user", JSON.stringify(user));

      setUser(user);
      //router.replace("/(farmer)"); // Or your main app route
    } else {
      // This will be thrown if the backend response is not what we expect
      throw new Error(
        "Registration succeeded but the server response was invalid."
      );
    }
  };

  // --- LOGOUT FUNCTION ---
  const logout = async () => {
    // Remove all session data from storage
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");

    setUser(null);
    router.replace("/(auth)/login");
  };

  // Provide all functions and state to children
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

}
// --- Custom Hook to use the Auth Context ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
