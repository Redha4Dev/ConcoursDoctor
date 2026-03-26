import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { AuthProvider, useAuth } from "../../providers/AuthProvider";

import "../global.css"

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

useEffect(() => {
  if (loading) return;

  const inAuthGroup = segments[0] === "(auth)";
  const isRoot = segments.length === 0;

  if (!user && !inAuthGroup) {
    router.replace("/(auth)/login");
  } 
  else if (user && (inAuthGroup || isRoot)) {
    router.replace("/(home)"); // or /(home)
  }
}, [user, loading, segments, router]);



  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
