import GameScreen from "../src/screens/GameScreen";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

export default function Game() {
  return (
    <>
      <StatusBar
        hidden={true}
        style="light"
        translucent={true}
        backgroundColor="transparent"
      />
      <GameScreen />
    </>
  );
}