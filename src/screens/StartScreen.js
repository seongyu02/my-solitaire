// src/screens/StartScreen.js
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router"; // ✅ expo-router로 화면 이동
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StartScreen() {
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [checkingSave, setCheckingSave] = useState(true);

  // 앱 시작 시 저장된 게임 있는지 확인
  useEffect(() => {
    const checkSavedGame = async () => {
      try {
        const saved = await AsyncStorage.getItem("solitaire_game");
        setHasSavedGame(!!saved);
      } catch (e) {
        console.log("저장된 게임 확인 에러:", e);
      } finally {
        setCheckingSave(false);
      }
    };

    checkSavedGame();
  }, []);

  const handleContinue = () => {
    if (!hasSavedGame) {
      Alert.alert("이어하기 불가", "이어하기 할 게임이 없습니다.");
      return;
    }
    router.push("/game");
  };

  const handleNewGame = () => {
    // 이어하기 가능한 게임이 있는 경우 → 안내 후 확인 받고 진행
    if (hasSavedGame) {
      Alert.alert(
        "이어하기 가능한 게임 있음",
        "이어하기 할 수 있는 게임이 있습니다.\n새 게임을 시작하면 기존 이어하기 기록은 사라집니다.\n계속 진행할까요?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "새 게임 시작",
            style: "destructive",
            onPress: async () => {
              try {
                await AsyncStorage.removeItem("solitaire_game");
              } catch (e) {
                console.log("새 게임 시작 전 저장 삭제 에러:", e);
              }
              router.push("/game");
            }
          }
        ]
      );
    } else {
      // 이어하기 기록이 아예 없으면 바로 새 게임 시작
      (async () => {
        try {
          await AsyncStorage.removeItem("solitaire_game");
        } catch (e) {
          console.log("새 게임 시작 전 저장 삭제 에러:", e);
        }
        router.push("/game");
      })();
    }
  };

  return (
    <LinearGradient colors={["#1c1c1c", "#0b402d"]} style={styles.container}>
      <Text style={styles.title}>Solitaire</Text>

      <View style={styles.cardShadowBox}>
        <Text style={styles.subTitle}>Classic Klondike</Text>
      </View>

      {/* 🔹 새 게임 버튼 (위에 배치, 메인 동작) */}
      <TouchableOpacity
        style={[styles.button, styles.startButton]}
        onPress={handleNewGame}
      >
        <Text style={styles.buttonText}>새 게임</Text>
      </TouchableOpacity>

      {/* 🔹 이어하기 버튼 (저장 없으면 안내 후 막음) */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.newGameButton,
          (!hasSavedGame || checkingSave) && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={checkingSave}  // 확인 중일 때만 잠깐 막기
      >
        <Text style={styles.buttonText}>
          {checkingSave ? "확인 중..." : "이어하기"}
        </Text>
      </TouchableOpacity>

      {/* 🔹 기록 보기 버튼 */}
      <TouchableOpacity
        style={[styles.button, styles.recordButton]}
        onPress={() => router.push("/record")} // ✅ /record 화면으로 이동
      >
        <Text style={styles.buttonText}>기록 보기</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6
  },
  subTitle: {
    fontSize: 18,
    color: "#cccccc",
    fontWeight: "500"
  },
  cardShadowBox: {
    marginBottom: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5
  },
  button: {
    width: "75%",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6
  },
  startButton: {
    backgroundColor: "#1DBF73"
  },
  recordButton: {
    backgroundColor: "#3A3A3A"
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700"
  },
  newGameButton: {
    backgroundColor: "#3478f6"
  },
  disabledButton: {
    opacity: 0.5
  }
});