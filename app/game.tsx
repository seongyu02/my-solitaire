import GameScreen from "../src/screens/GameScreen";
import { StatusBar } from "expo-status-bar";

export default function Game() {
  return (
    <>
      <StatusBar hidden={true} />
      <GameScreen />
    </>
  );
}