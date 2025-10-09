import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import apple from "@assets/images/img_apple.png";
import facebook from "@assets/images/img_facebook.png";
import google from "@assets/images/img_google.png";

import { useLoginMutation } from "@/store/auth/authApiSlice";
import { setAuth } from "@/store/auth/authSlice";
import { saveAccessToken, saveRefreshToken } from "@/store/auth/tokenManager";
import { useDispatch } from "@/store/hooks";

export const images = {
  google,
  apple,
  facebook,
};

export default function SignIn() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isChecked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const onSignInPress = async () => {
    // 입력 검증
    if (!email.trim()) {
      Alert.alert("알림", "이메일을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("알림", "비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setAuth());

      if (Platform.OS === "android") {
        await saveAccessToken(res.access);
        await saveRefreshToken(res.refresh);
      }

      router.push("/");
    } catch (error: any) {
      console.error("로그인 실패 상세:", {
        message: error.message,
        status: error.status,
        data: error.data,
        originalStatus: error.originalStatus,
      });

      let errorMessage = "로그인에 실패했습니다.";

      if (error.status === 401) {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.status === 500) {
        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.status === "FETCH_ERROR") {
        errorMessage = "네트워크 연결을 확인해주세요.";
      } else if (error.originalStatus === 404) {
        errorMessage = "서비스를 찾을 수 없습니다.";
      }

      Alert.alert("로그인 실패", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Header Section */}
            <View className="items-center pt-4 pb-4">
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
                <Ionicons name="person" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-white mb-2">
                환영합니다!
              </Text>
              <Text className="text-lg text-white/80">계정에 로그인하세요</Text>
            </View>

            {/* Form Section */}
            <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">이메일</Text>
                <View
                  className={`relative border-2 rounded-xl ${
                    emailFocused
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <TextInput
                    className="text-lg text-gray-800 px-4 py-4 pr-12"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={setEmail}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={emailFocused ? "#3B82F6" : "#9CA3AF"}
                    style={{ position: "absolute", right: 16, top: 20 }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">비밀번호</Text>
                <View
                  className={`relative border-2 rounded-xl ${
                    passwordFocused
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <TextInput
                    className="text-lg text-gray-800 px-4 py-4 pr-12"
                    value={password}
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 16, top: 20 }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={passwordFocused ? "#3B82F6" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setChecked(!isChecked)}
                >
                  <Checkbox
                    value={isChecked}
                    onValueChange={setChecked}
                    color={isChecked ? "#3B82F6" : "#D1D5DB"}
                  />
                  <Text className="text-gray-600 ml-2">로그인 상태 유지</Text>
                </TouchableOpacity>

                <Link href="/" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-500 font-medium">
                      비밀번호 찾기
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                className={`rounded-xl py-4 mb-6 ${
                  isLoading ? "bg-gray-400" : "bg-blue-500"
                }`}
                onPress={onSignInPress}
                disabled={isLoading}
              >
                <View className="flex-row items-center justify-center">
                  {isLoading ? (
                    <ActivityIndicator color="white" className="mr-2" />
                  ) : (
                    <Ionicons
                      name="log-in-outline"
                      size={20}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-lg font-semibold">
                    {isLoading ? "로그인 중..." : "로그인"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View className="flex-row items-center justify-center mb-6">
                <Text className="text-gray-600">계정이 없으신가요? </Text>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-500 font-medium">회원가입</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="px-4 text-gray-500">또는</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Social Login */}
              <View className="flex-row justify-between mr-10 ml-10 mb-6">
                <TouchableOpacity className="w-14 h-14 bg-white border border-gray-200 rounded-xl items-center justify-center shadow-md">
                  <Image source={images.google} className="w-6 h-6" />
                </TouchableOpacity>

                <TouchableOpacity className="w-14 h-14 bg-white border border-gray-200 rounded-xl items-center justify-center shadow-md">
                  <Image source={images.facebook} className="w-6 h-6" />
                </TouchableOpacity>

                <TouchableOpacity className="w-14 h-14 bg-white border border-gray-200 rounded-xl items-center justify-center shadow-md">
                  <Image source={images.apple} className="w-6 h-6" />
                </TouchableOpacity>
              </View>

              {/* Home Link */}
              <View className="items-center pb-6">
                <Link href="/" asChild>
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons
                      name="home-outline"
                      size={20}
                      color="#6B7280"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-gray-500 font-medium">
                      홈으로 돌아가기
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
