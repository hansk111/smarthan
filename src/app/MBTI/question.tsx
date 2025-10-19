import { answerQuestion, calculateResult } from "@/store/mbti/mbtiSlice";
import { AppDispatch, RootState } from "@/store/store";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function QuestionScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { questions, currentIndex, result } = useSelector(
    (state: RootState) => state.mbti
  );

  const curQ = questions[currentIndex];

  const onPressAnswer = useCallback(
    (answer: "A" | "B") => {
      dispatch(answerQuestion({ dimension: curQ.dimension, answer }));
    },
    [dispatch, curQ?.dimension]
  );

  useEffect(() => {
    if (currentIndex >= questions.length) {
      dispatch(calculateResult());
      const timer = setTimeout(() => {
        router.replace("/MBTI/result");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questions.length, dispatch, router]);

  if (currentIndex >= questions.length) {
    return (
      <LinearGradient
        colors={["#6366f1", "#a855f7", "#f472b6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text className="mt-4 text-lg text-white font-medium">
          결과를 계산 중...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#9333ea", "#ec4899", "#f87171"]}
      className="flex-1 justify-center px-6 pt-10"
    >
      {/* 진행 바 */}
      <View className="h-2 bg-white/30 rounded-full mb-6 overflow-hidden">
        <View
          className="h-full bg-white"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </View>

      {/* 질문 카드 */}
      <View className="bg-gray-500 rounded-2xl shadow-xl p-5 mb-8">
        <Text className="text-2xl font-extrabold text-white mb-2 text-center">
          질문
        </Text>
        <View className="w-full h-[1px] bg-gray-400 mb-2" />
        <Text className="text-xl font-bold text-white text-center">
          {curQ.text}
        </Text>
      </View>

      {/* 답변 버튼 */}
      <Pressable
        className="bg-white/90 rounded-full py-4 px-4 mb-4 shadow-md active:scale-95"
        onPress={() => onPressAnswer("A")}
      >
        <Text className="text-purple-600 text-lg font-semibold text-center">
          {curQ.optionA}
        </Text>
      </Pressable>

      <Pressable
        className="bg-white/90 rounded-full py-4 px-6 shadow-md active:scale-95"
        onPress={() => onPressAnswer("B")}
      >
        <Text className="text-purple-600 text-lg font-semibold text-center">
          {curQ.optionB}
        </Text>
      </Pressable>

      {/* 진행 상태 */}
      <Text className="mt-6 text-sm text-white text-center font-medium">
        {currentIndex + 1} / {questions.length}
      </Text>
    </LinearGradient>
  );
}
