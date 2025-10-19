// src/app/result.tsx
import { restart } from "@/store/mbti/mbtiSlice";
import { AppDispatch, RootState } from "@/store/store";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import BadgeList from "@/components/mbti/BadgeList";
import SectionHeader from "@/components/mbti/SectionHeader";
import mbtiDetail from "@/data/mbtiDetail.json";

const letterDescriptionMap: Record<string, string> = {
  I: "Introversion - 에너지를 내면에서 얻고, 혼자 있는 시간을 선호합니다.",
  E: "Extraversion - 외부 사람·활동에서 에너지를 얻으며, 사교적입니다.",
  N: "iNtuition - 가능성·패턴·큰 그림을 중시하고 직관적으로 사고합니다.",
  S: "Sensing - 현재·구체적인 사실·현실적인 정보를 중시합니다.",
  T: "Thinking - 논리·분석·객관적인 기준으로 판단합니다.",
  F: "Feeling - 사람·가치·관계에 기반해 판단합니다.",
  J: "Judging - 구조·계획·결정을 선호하고, 일정을 미리 정합니다.",
  P: "Perceiving - 융통성·즉흥·새로운 상황에 열려 있습니다.",
};

const simpleDescriptionMap: Record<string, string> = {
  INTJ: "독립적이며 목표 지향적, 장기적인 비전을 설계한다.",
  INTP: "호기심이 많고 객관적인 사고를 중시한다.",
  ENTJ: "리더십이 뛰어나며 효율적인 조직 운영을 선호한다.",
  ENTP: "창의적이고 새로운 아이디어를 탐구한다.",
  INFJ: "깊은 통찰과 인간관계에 대한 배려가 강하다.",
  INFP: "이상주의적이며 진정성을 중시한다.",
  ENFJ: "타인을 돕고 격려하며 사회적 조화를 만든다.",
  ENFP: "열정적이고 창의적이며 사람과 경험을 사랑한다.",
  ISTJ: "실용적이고 책임감이 강하며 체계적인 일을 선호한다.",
  ISFJ: "타인 배려와 세심함으로 주변을 돌본다.",
  ESTJ: "조직을 효율적으로 운영하고 규칙을 중시한다.",
  ESFJ: "타인의 감정을 잘 파악하고 조화로운 관계를 만든다.",
  ISTP: "실제적인 문제 해결과 손재주가 뛰어나다.",
  ISFP: "감각적이고 예술적인 경험을 즐긴다.",
  ESTP: "행동력이 뛰어나고 순간적인 기회를 잡는다.",
  ESFP: "사교적이며 즐거움을 추구한다.",
};

const animalMap: Record<string, { name: string; img: any }> = {
  INTJ: { name: "부엉이", img: require("@assets/animals/owl.png") },
  INTP: { name: "다람쥐", img: require("@assets/animals/squirrel.png") },
  ENTJ: { name: "사자", img: require("@assets/animals/lion.png") },
  ENTP: { name: "여우", img: require("@assets/animals/fox.png") },
  INFJ: { name: "돌고래", img: require("@assets/animals/dolphin.png") },
  INFP: { name: "고양이", img: require("@assets/animals/cat.png") },
  ENFJ: { name: "코끼리", img: require("@assets/animals/elephant.png") },
  ENFP: {
    name: "돌고래(활동적인)",
    img: require("@assets/animals/dolphin.png"),
  },
  ISTJ: { name: "벌", img: require("@assets/animals/bee.png") },
  ISFJ: { name: "거북이", img: require("@assets/animals/turtle.png") },
  ESTJ: { name: "개(작업견)", img: require("@assets/animals/dog.png") },
  ESFJ: {
    name: "돌고래(협동적인)",
    img: require("@assets/animals/dolphin.png"),
  },
  ISTP: { name: "표범", img: require("@assets/animals/leopard.png") },
  ISFP: { name: "나비", img: require("@assets/animals/butterfly.png") },
  ESTP: { name: "상어", img: require("@assets/animals/shark.png") },
  ESFP: { name: "오랑우탄", img: require("@assets/animals/orangutan.png") },
};

export default function ResultScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const result = useSelector((state: RootState) => state.mbti.result);

  useEffect(() => {
    if (!result) {
      router.replace("/MBTI");
    }
  }, [result, router]);

  const onRetake = useCallback(() => {
    dispatch(restart());
    router.push("/MBTI");
  }, [dispatch, router]);

  if (!result) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-lg">결과를 불러오는 중...</Text>
      </View>
    );
  }

  const detail = (mbtiDetail as Record<string, any>)[result];
  const simpleDescription =
    simpleDescriptionMap[result] ?? "당신은 고유한 성격을 가지고 있습니다!";

  const letters = result.split("");
  const lettersDetail = letters
    .map((l) => `${l}: ${letterDescriptionMap[l] ?? ""}`)
    .join("\n");

  const animal = animalMap[result] ?? { name: "동물 비유 없음", img: null };

  return (
    <LinearGradient
      colors={["#a5b4fc", "#e9d5ff", "#fbcfe8"]}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        {/* ---------- 상단 결과 요약 ---------- */}
        <View className="items-center mt-10">
          <Text className="text-4xl font-extrabold text-purple-700 mb-2">
            {result}
          </Text>
          <Text className="text-2xl font-extrabold text-purple-700 mb-2">
            ({detail.tagline})
          </Text>
          <Text className="text-lg text-center text-gray-800 font-medium">
            {simpleDescription}
          </Text>
        </View>

        <View className="flex-1 items-center rounded-xl bg-green-100 py-2 mt-4">
          {animal.img && (
            <Image
              className="bg-gray-300 rounded-full border-gray-950"
              source={animal.img}
              style={{
                width: 150,
                height: 150,
                marginVertical: 12,
                marginHorizontal: 6,
              }}
              resizeMode="contain"
            />
          )}
          <Text className="text-lg text-gray-600 mb-4">
            동물 비유: <Text className="font-semibold">{animal.name}</Text>
          </Text>
        </View>

        {/* 각 글자 설명 */}
        <View className="w-full mt-6 bg-gray-200 rounded-xl p-4 shadow-md">
          <Text className="text-base font-semibold text-purple-700 mb-2">
            각 글자별 의미
          </Text>
          <Text className="text-sm text-gray-700 leading-relaxed">
            {lettersDetail}
          </Text>
        </View>

        {/* ---------- 상세 정보 ---------- */}
        {detail ? (
          <>
            {[
              { title: "특징", key: "traits", icon: detail.icons?.traits },
              {
                title: "강점",
                key: "strengths",
                icon: detail.icons?.strengths,
              },
              {
                title: "약점",
                key: "weaknesses",
                icon: detail.icons?.weaknesses,
              },
              { title: "추천 직업", key: "career", icon: detail.icons?.career },
              { title: "연애·관계", key: "love", icon: detail.icons?.love },
              {
                title: "성장 포인트",
                key: "growth",
                icon: detail.icons?.growth,
              },
            ].map((section) => (
              <View
                key={section.key}
                className="bg-gray-100 rounded-xl p-4 shadow-md my-4"
              >
                <SectionHeader
                  title={section.title}
                  iconName={section.icon as any}
                />
                <BadgeList
                  items={detail[section.key] ?? []}
                  iconName={section.icon as any}
                />
              </View>
            ))}
          </>
        ) : (
          <View className="my-6">
            <Text className="text-center text-gray-500">
              자세한 유형 정보가 준비되지 않았어요.
            </Text>
          </View>
        )}

        {/* ---------- 다시 시작 버튼 ---------- */}
        <View className="mt-10 items-center">
          <Pressable
            className="bg-purple-600 rounded-full px-8 py-4 shadow-lg active:scale-95"
            onPress={onRetake}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-white text-lg font-bold tracking-wide">
                다시 시작하기
              </Text>
              <MaterialCommunityIcons name="restart" size={24} color="white" />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
