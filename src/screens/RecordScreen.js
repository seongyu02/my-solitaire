// src/screens/RecordScreen.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function RecordScreen() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const saved = await AsyncStorage.getItem("solitaire_records");
      if (saved) setRecords(JSON.parse(saved));
      else setRecords([]);
    } catch (e) {
      console.log("기록 불러오기 오류:", e);
    }
  };

  return (
    <LinearGradient colors={["#004820", "#00733a"]} style={styles.root}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>⬅</Text>
        </TouchableOpacity>
        <Text style={styles.title}>최고 점수 기록</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 기록 목록 */}
      <ScrollView style={{ width: "100%" }} contentContainerStyle={styles.container}>
        {[1, 2, 3, 4, 5, 6, 7].map((rank, index) => {
          const item = records[index];
          return (
            <View key={rank} style={styles.recordRow}>
              {/* 순위 원 */}
              <View style={[styles.rankCircle, styles[`rankColor${rank}`]]}>
                <Text style={styles.rankText}>{rank}</Text>
              </View>

              {/* 점수 + 날짜 */}
              <View style={styles.recordContent}>
                <Text style={styles.scoreText}>{item ? item.score : "---"}</Text>
                <Text style={styles.dateText}>{item ? item.date : "---"}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  backButton: {
    fontSize: 26,
    color: "#ffffff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f5d57d",
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },

  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  rankText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  // 🥇🥈🥉 메달 색 적용
  rankColor1: { backgroundColor: "#FFD700" },
  rankColor2: { backgroundColor: "#C0C0C0" },
  rankColor3: { backgroundColor: "#CD7F32" },

  // 나머지 색
  rankColor4: { backgroundColor: "#555555" },
  rankColor5: { backgroundColor: "#555555" },
  rankColor6: { backgroundColor: "#555555" },
  rankColor7: { backgroundColor: "#555555" },

  recordContent: {
    flex: 1,
  },

  scoreText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },

  dateText: {
    color: "#cfcfcf",
    fontSize: 12,
    marginTop: 3,
  },
});
