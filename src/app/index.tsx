import { images } from "@/constants/images";
import { useSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/profile" />;
  }

  const features = [
    {
      icon: "bus-outline",
      title: "실시간 버스 정보",
      description: "주변 정류장의 버스 도착 시간을 실시간으로 확인하세요",
      color: "#3B82F6",
    },
    {
      icon: "musical-notes-outline",
      title: "음악 재생",
      description: "좋아하는 MP3 파일을 언제든지 재생할 수 있어요",
      color: "#10B981",
    },
    {
      icon: "play-circle-outline",
      title: "엔터테인먼트",
      description: "재미있는 영상과 콘텐츠를 즐겨보세요",
      color: "#F59E0B",
    },
  ];

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      {/* Hero Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={images.beachImage}
          style={styles.fullWidthImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.4)"]}
          style={styles.imageOverlay}
        />

        {/* Floating Welcome Text */}
        <Animated.View
          style={[
            styles.welcomeTextContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text className="text-3xl font-bold text-white text-center mb-2 drop-shadow-md">
            SmartHAN Center
          </Text>
          <Text className="text-lg text-white/90 text-center drop-shadow">
            스마트한 일상의 시작
          </Text>
        </Animated.View>
      </View>

      {/* Content Section */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#f8fafc"]}
          className="flex-1 rounded-t-[25px] px-5 pt-[30px]"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Action Buttons */}
            <View className="mb-[30px] gap-4">
              <TouchableOpacity
                className="rounded-2xl shadow-lg shadow-indigo-500/30 elevation-6 bg-indigo-500"
                onPress={() => router.push("/signin")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  className="flex-row items-center justify-center py-4 px-6 rounded-2xl gap-2"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="log-in-outline" size={24} color="white" />
                  <Text className="text-white text-lg font-bold">로그인</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-2xl shadow-lg shadow-emerald-500/30"
                // style={styles.secondaryButton}
                onPress={() => router.push("/signup")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  className="flex-row items-center justify-center py-4 px-6 rounded-2xl gap-2"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="person-add-outline" size={24} color="white" />
                  <Text className="text-white text-lg font-bold">회원가입</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Features Section */}
            <View className="mb-[30px]">
              <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                주요 기능
              </Text>
              <Text className="text-base text-gray-500 text-center mb-6 leading-6">
                SmartHAN Center와 함께 더 편리한 일상을 경험해보세요
              </Text>

              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateX: Animated.multiply(
                            slideAnim,
                            new Animated.Value(index % 2 === 0 ? 1 : -1)
                          ),
                        },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: `${feature.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={feature.icon as any}
                      size={28}
                      color={feature.color}
                    />
                  </View>
                  <View className="flex-1 justify-center">
                    <Text className="text-xl font-bold text-gray-800 mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-sm text-gray-500 leading-5">
                      {feature.description}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Bottom CTA */}
            <View className="items-center py-10">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                지금 바로 시작해보세요!
              </Text>
              <TouchableOpacity
                // style={styles.ctaButton}
                className="flex-row items-center bg-white py-3 px-6 rounded-full border-2 border-indigo-500 gap-2"
                onPress={() => router.push("/signup")}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-indigo-500">
                  무료로 시작하기
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    height: height * 0.45,
  },
  fullWidthImage: {
    width: width,
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  welcomeTextContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },

  contentContainer: {
    flex: 1,
    marginTop: -20,
  },

  buttonContainer: {
    marginBottom: 30,
    gap: 16,
  },

  featureCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  // ctaContainer: {
  //   alignItems: "center",
  //   paddingVertical: 20,
  // },
});

export default WelcomeScreen;
