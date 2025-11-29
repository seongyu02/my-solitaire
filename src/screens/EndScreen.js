// src/screens/EndScreen.js
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

export default function EndScreen() {
  // ⭐ expo-router에서 넘어온 값 받기
  const { time, moves, score } = useLocalSearchParams();

  return (
    <LinearGradient colors={["#004820", "#00733a"]} style={styles.root}>
      <View style={styles.container}>
        {/* Clear 타이틀 */}
        <Text style={styles.clearText}>CLEAR!</Text>

        {/* 기록 박스 */}
        <View style={styles.recordBox}>
          <Text style={styles.label}>시간</Text>
          <Text style={styles.value}>{String(time)}</Text>

          <Text style={[styles.label, { marginTop: 16 }]}>이동</Text>
          <Text style={styles.value}>{String(moves)}</Text>

          <Text style={[styles.label, { marginTop: 16 }]}>점수</Text>
          <Text style={styles.value}>{String(score)}</Text>
        </View>

        {/* 버튼 2개 */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/game")}
        >
          <Text style={styles.buttonText}>다시 하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#333" }]}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>메뉴로</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "80%",
    alignItems: "center",
  },

  clearText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 40,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },

  recordBox: {
    width: "80%",
    paddingVertical: 25,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 50,
  },

  label: {
    fontSize: 18,
    color: "#ffeb9e",
    fontWeight: "600",
  },

  value: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "800",
    marginTop: 4,
  },

  button: {
    width: "70%",
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: "#1DBF73",
    alignItems: "center",
    marginBottom: 18,
  },

  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
