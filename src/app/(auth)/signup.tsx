import apple from "@assets/images/img_apple.png";
import facebook from "@assets/images/img_facebook.png";
import google from "@assets/images/img_google.png";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import * as React from "react";
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

export const images = {
  google,
  apple,
  facebook,
};

export default function SignUp() {
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Focus states
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] =
    React.useState(false);
  const [firstNameFocused, setFirstNameFocused] = React.useState(false);
  const [lastNameFocused, setLastNameFocused] = React.useState(false);

  // Validation
  const validateInputs = () => {
    if (!firstName.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("알림", "성을 입력해주세요.");
      return false;
    }
    if (!emailAddress.trim()) {
      Alert.alert("알림", "이메일을 입력해주세요.");
      return false;
    }
    if (!emailAddress.includes("@")) {
      Alert.alert("알림", "올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("알림", "비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      // 여기에 실제 회원가입 API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 임시 지연
      setPendingVerification(true);
    } catch (error: any) {
      Alert.alert("회원가입 실패", error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!code.trim()) {
      Alert.alert("알림", "인증 코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 여기에 실제 인증 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 임시 지연
      Alert.alert("성공", "회원가입이 완료되었습니다!");
      // router.push("/(auth)/signin");
    } catch (error: any) {
      Alert.alert("인증 실패", error.message || "인증에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {/* Header */}
              <View className="items-center pt-20 pb-8">
                <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-6">
                  <Ionicons name="mail" size={40} color="white" />
                </View>
                <Text className="text-3xl font-bold text-white mb-2">
                  이메일 인증
                </Text>
                <Text className="text-lg text-white/80 text-center px-6">
                  {emailAddress}로 전송된 인증 코드를 입력하세요
                </Text>
              </View>

              {/* Verification Form */}
              <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
                <View className="mb-8">
                  <Text className="text-gray-700 font-medium mb-2">
                    인증 코드
                  </Text>
                  <View className="border-2 border-gray-200 rounded-xl bg-gray-50">
                    <TextInput
                      className="text-2xl text-center text-gray-800 px-4 py-6 tracking-widest"
                      value={code}
                      placeholder="000000"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={6}
                      onChangeText={setCode}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  className={`rounded-xl py-4 mb-6 ${isLoading ? "bg-gray-400" : "bg-blue-500"
                    }`}
                  onPress={onVerifyPress}
                  disabled={isLoading}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading && (
                      <ActivityIndicator color="white" className="mr-2" />
                    )}
                    <Text className="text-white text-lg font-semibold">
                      {isLoading ? "인증 중..." : "인증하기"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="items-center">
                  <Text className="text-gray-500 mb-2">
                    인증 코드를 받지 못하셨나요?
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-blue-500 font-medium">다시 전송</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
            <View className="items-center pt-12 pb-6">
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="person-add" size={40} color="white" />
              </View>
              <Text className="text-4xl font-bold text-white mb-2">
                계정 만들기
              </Text>
              <Text className="text-lg text-white/80">
                새로운 여정을 시작하세요
              </Text>
            </View>

            {/* Form Section */}
            <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
              {/* Name Inputs */}
              <View className="flex-row space-x-3 mb-6">
                <View className="flex-1">
                  <Text className="text-gray-700 font-medium mb-2">이름</Text>
                  <View
                    className={`border-2 rounded-xl ${firstNameFocused
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                      }`}
                  >
                    <TextInput
                      className="text-lg text-gray-800 px-4 py-4"
                      value={firstName}
                      placeholder="이름"
                      placeholderTextColor="#9CA3AF"
                      onFocus={() => setFirstNameFocused(true)}
                      onBlur={() => setFirstNameFocused(false)}
                      onChangeText={setFirstName}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-gray-700 font-medium mb-2">성</Text>
                  <View
                    className={`border-2 rounded-xl ${lastNameFocused
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                      }`}
                  >
                    <TextInput
                      className="text-lg text-gray-800 px-4 py-4"
                      value={lastName}
                      placeholder="성"
                      placeholderTextColor="#9CA3AF"
                      onFocus={() => setLastNameFocused(true)}
                      onBlur={() => setLastNameFocused(false)}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">이메일</Text>
                <View
                  className={`relative border-2 rounded-xl ${emailFocused
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                    }`}
                >
                  <TextInput
                    className="text-lg text-gray-800 px-4 py-4 pr-12"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={emailAddress}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={setEmailAddress}
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
                  className={`relative border-2 rounded-xl ${passwordFocused
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                    }`}
                >
                  <TextInput
                    className="text-lg text-gray-800 px-4 py-4 pr-12"
                    value={password}
                    placeholder="비밀번호를 입력하세요 (6자 이상)"
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

              {/* Confirm Password Input */}
              <View className="mb-8">
                <Text className="text-gray-700 font-medium mb-2">
                  비밀번호 확인
                </Text>
                <View
                  className={`relative border-2 rounded-xl ${confirmPasswordFocused
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                    }`}
                >
                  <TextInput
                    className="text-lg text-gray-800 px-4 py-4 pr-12"
                    value={confirmPassword}
                    placeholder="비밀번호를 다시 입력하세요"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: "absolute", right: 16, top: 20 }}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={confirmPasswordFocused ? "#3B82F6" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                className={`rounded-xl py-4 mb-6 ${isLoading ? "bg-gray-400" : "bg-blue-500"
                  }`}
                onPress={onSignUpPress}
                disabled={isLoading}
                style={{
                  boxShadow: "0px 4px 8px rgba(59, 130, 246, 0.3)",
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center justify-center">
                  {isLoading ? (
                    <ActivityIndicator color="white" className="mr-2" />
                  ) : (
                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className="text-white text-lg font-semibold">
                    {isLoading ? "계정 생성 중..." : "계정 만들기"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View className="flex-row items-center justify-center mb-6">
                <Text className="text-gray-600">이미 계정이 있으신가요? </Text>
                <Link href="/(auth)/signin" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-500 font-medium">로그인</Text>
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
              <View className="flex-row justify-center space-x-4 mb-8">
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
