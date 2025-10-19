import { restart } from "@/store/mbti/mbtiSlice";
import { AppDispatch } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";

const Mbti_layout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const onRetake = useCallback(() => {
    dispatch(restart());
    router.push("/MBTI");
  }, [dispatch, router]);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{
          title: "MBTI 테스트",

          headerTintColor: "black",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              className="ml-4"
              onPress={() => router.replace("/apps")}
            >
              <Ionicons name="arrow-back-circle" size={40} color="pink" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="question"
        options={{
          title: "MBTI 질문에 답하세요",

          headerTintColor: "black",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity className="ml-4" onPress={() => router.back()}>
              <Ionicons name="arrow-back-circle" size={40} color="pink" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: "MBTI 결과",

          headerTintColor: "black",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity className="ml-4" onPress={onRetake}>
              <Ionicons name="arrow-back-circle" size={40} color="pink" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default Mbti_layout;
