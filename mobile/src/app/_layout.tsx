import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { AuthProvider, useAuth } from "../../providers/AuthProvider";

import "../global.css";

import { useState } from "react";
import { I18nManager } from "react-native";
import { i18n, setLanguage } from "../../locales/i18n";
import { Platform } from "react-native";
import * as Updates from "expo-updates";
import { DevSettings } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  const [isReady, setIsReady] = useState(false);
  const [lang, setLang] = useState(i18n.locale);



  useEffect(() => {
  (async () => {
    const savedLang = await AsyncStorage.getItem("APP_LANGUAGE");

    const newLang = savedLang || "en";
    i18n.locale = newLang;
    setLang(newLang);

    const shouldBeRTL = newLang === "ar";

    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);

      console.log("🔁 Restarting app to apply RTL...");

      try {
        await Updates.reloadAsync();
      } catch {
        DevSettings.reload();
      }

      return;
    }

    setIsReady(true);
  })();
}, []);


  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    //@ts-ignore
    const isRoot = segments.length === 0;

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && (inAuthGroup || isRoot)) {
      router.replace("/(home)"); // or /(home)
    }
  }, [user, loading, segments, router]);

  if (!isReady || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  

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
