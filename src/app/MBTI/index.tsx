import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#a855f7", "#f472b6", "#fca5a5"]}
      className="flex-1 justify-center items-center px-6"
    >
      <Text className="text-3xl font-bold text-white mb-12">
        나만의 MBTI 테스트
      </Text>

      <Pressable
        className="bg-white rounded-full px-8 py-4 shadow-lg active:scale-95"
        onPress={() => router.push("/MBTI/question")}
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-purple-600 text-lg font-bold tracking-wider">
            시작하기
          </Text>
          <MaterialIcons name="start" size={24} color="#9333ea" />
        </View>
      </Pressable>
    </LinearGradient>
  );
}
