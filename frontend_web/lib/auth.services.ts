// lib/auth.ts
import { api } from "@/lib/api"; // Adjust this path if your api.ts is in utils/api.ts

export const authService = {
  /**
   * Sends a password reset link to the user's email.
   */
  async forgotPassword(email: string) {
    const response = await api.post("/api/v1/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Resets the password using the token from the email link.
   */
  async resetPassword(token: string, newPassword: string) {
    const response = await api.post("/api/v1/auth/reset-password", { 
      token, 
      newPassword 
    });
    return response.data;
  }
};