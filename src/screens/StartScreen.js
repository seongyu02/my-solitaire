// src/screens/StartScreen.js
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";  // ✅ expo-router로 화면 이동

export default function StartScreen() {
  return (
    <LinearGradient colors={["#1c1c1c", "#0b402d"]} style={styles.container}>
      <Text style={styles.title}>Solitaire</Text>

      <View style={styles.cardShadowBox}>
        <Text style={styles.subTitle}>Classic Klondike</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.startButton]}
        onPress={() => router.push("/game")}   // ✅ /game 화면으로 이동
      >
        <Text style={styles.buttonText}>게임 시작</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.recordButton]}
        onPress={() => alert("RecordScreen 만들면 연결 가능")}
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
  }
});