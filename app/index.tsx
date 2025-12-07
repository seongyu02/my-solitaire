// app/index.tsx
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";

import StartScreen from "../src/screens/StartScreen";

export default function Index() {
  useEffect(() => {
    const hideNavBar = async () => {
      if (Platform.OS !== "android") return;

      try {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } catch (e) {
        console.log("NavBar 숨기기 에러:", e);
      }
    };

    hideNavBar();
  }, []);

  return (
    <>
      <StatusBar
        hidden={true}
        style="light"
        translucent={true}
        backgroundColor="transparent"
      />
      <StartScreen />
    </>
  );
}