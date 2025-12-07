// src/screens/StartScreen.js
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image          // ⭐ 추가
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router"; // ✅ expo-router로 화면 이동
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⭐ 카드 미리보기용 이미지 (c1 예시)
import baseSample from "../assets/images/base/c/c1.png";
import originalSample from "../assets/images/original/c/c1.png";

export default function StartScreen() {
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [checkingSave, setCheckingSave] = useState(true);

  // ⭐ 현재 카드 테마 상태 (base / original)
  const [cardTheme, setCardTheme] = useState("base");

  // ⭐ 커스터마이징 모달 상태
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [pendingTheme, setPendingTheme] = useState("base");

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

  // ⭐ 앱 시작 시 카드 테마 불러오기
  useEffect(() => {
    const loadCardTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("card_theme");
        if (savedTheme) {
          setCardTheme(savedTheme);
        }
      } catch (e) {
        console.log("카드 테마 로드 에러:", e);
      }
    };

    loadCardTheme();
  }, []);

  // ⭐ 카드 테마 저장 함수
  const setThemeAndSave = async (theme) => {
    try {
      await AsyncStorage.setItem("card_theme", theme);
      setCardTheme(theme);
      Alert.alert(
        "카드 이미지 변경",
        theme === "original"
          ? "오리지널 카드 이미지가 적용되었습니다."
          : "기본 카드 이미지가 적용되었습니다."
      );
    } catch (e) {
      console.log("카드 테마 저장 에러:", e);
    }
  };

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

  // ⭐ 카드 이미지 선택 버튼 눌렀을 때 → 모달 열기
  const handleSelectCardImage = () => {
    setPendingTheme(cardTheme);   // 현재 테마를 기본 선택값으로
    setShowThemeModal(true);
  };

  // ⭐ 확인 버튼 눌렀을 때만 실제 테마 저장
  const handleConfirmTheme = async () => {
    await setThemeAndSave(pendingTheme);
    setShowThemeModal(false);
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
        disabled={checkingSave} // 확인 중일 때만 잠깐 막기
      >
        <Text style={styles.buttonText}>
          {checkingSave ? "확인 중..." : "이어하기"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.cardButton]}
        onPress={handleSelectCardImage}
      >
        <Text style={styles.buttonText}>커스터마이징</Text>
      </TouchableOpacity>

      {/* 🔹 기록 보기 버튼 */}
      <TouchableOpacity
        style={[styles.button, styles.recordButton]}
        onPress={() => router.push("/record")} // ✅ /record 화면으로 이동
      >
        <Text style={styles.buttonText}>기록 보기</Text>
      </TouchableOpacity>

      {/* ⭐ 카드 이미지 선택 모달 */}
      {showThemeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>카드 이미지 선택</Text>

            <View style={styles.cardRow}>
              {/* 기본 카드 (base) */}
              <TouchableOpacity
                style={[
                  styles.cardChoice,
                  pendingTheme === "base" && styles.cardChoiceSelected
                ]}
                onPress={() => setPendingTheme("base")}
                activeOpacity={0.8}
              >
                <Image
                  source={baseSample}
                  style={styles.cardPreview}
                  resizeMode="contain"
                />
                <Text style={styles.cardLabel}>기본 카드</Text>
              </TouchableOpacity>

              {/* 오리지널 카드 (original) */}
              <TouchableOpacity
                style={[
                  styles.cardChoice,
                  pendingTheme === "original" && styles.cardChoiceSelected
                ]}
                onPress={() => setPendingTheme("original")}
                activeOpacity={0.8}
              >
                <Image
                  source={originalSample}
                  style={styles.cardPreview}
                  resizeMode="contain"
                />
                <Text style={styles.cardLabel}>오리지널 카드</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setShowThemeModal(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={handleConfirmTheme}
              >
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 카드 이미지 선택 */}
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
  },
  cardButton: {
    backgroundColor: "#e68a34ff"
  },

  // ⭐ 커스터마이징 모달 스타일
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 14
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 18
  },
  cardChoice: {
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent"
  },
  cardChoiceSelected: {
    borderColor: "#1DBF73",
    backgroundColor: "rgba(29,191,115,0.15)"
  },
  cardPreview: {
    width: 60,
    height: 90,
    marginBottom: 6
  },
  cardLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600"
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 8
  },
  modalCancel: {
    backgroundColor: "#444"
  },
  modalConfirm: {
    backgroundColor: "#1DBF73"
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14
  }
});