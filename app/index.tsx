// app/index.tsx
import { StatusBar } from "expo-status-bar";
import GameScreen from "../src/screens/GameScreen";

export default function Index() {
  return (
    <>
      {/* 상태바 숨기기 */}
      <StatusBar hidden />

      {/* 우리 솔리테어 화면 */}
      <GameScreen />
    </>
  );
}