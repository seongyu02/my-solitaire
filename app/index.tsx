import StartScreen from "../src/screens/StartScreen";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

export default function Index() {
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