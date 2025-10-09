import { useGetAllVideoQuery } from "@/store/video/VideoApiSlice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Video = () => {
  const { data: video, isLoading, refetch } = useGetAllVideoQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const [appState, setAppState] = useState(AppState.currentState);

  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const isAndroid = Platform.OS === "android";

  // 화면 크기 업데이트 함수
  const updateScreenDimensions = useCallback(() => {
    const newDimensions = Dimensions.get("window");
    setScreenData((prevData) => {
      // 실제로 크기가 변경된 경우만 업데이트
      if (
        prevData.width !== newDimensions.width ||
        prevData.height !== newDimensions.height
      ) {
        console.log("Screen dimensions updated:", newDimensions);
        return newDimensions;
      }
      return prevData;
    });
  }, []);

  // 화면 크기 변화 감지 - 폴더블 폰 지원 강화
  useEffect(() => {
    // 초기 화면 크기 설정
    updateScreenDimensions();

    // Dimensions change 이벤트 리스너
    const dimensionsSubscription = Dimensions.addEventListener(
      "change",
      updateScreenDimensions
    );

    // AppState 변화 감지 (폴더블 폰에서 앱이 background/foreground 될 때)
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // 앱이 다시 활성화될 때 화면 크기 재확인
        setTimeout(updateScreenDimensions, 100);
      }
      setAppState(nextAppState);
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // 폴더블 폰을 위한 추가 체크 - 주기적으로 화면 크기 확인
    const intervalCheck = setInterval(() => {
      updateScreenDimensions();
    }, 1000);

    // focus/blur 이벤트도 감지 (웹에서 유용)
    let focusListener, blurListener;
    if (isWeb && window) {
      focusListener = () => setTimeout(updateScreenDimensions, 100);
      blurListener = () => setTimeout(updateScreenDimensions, 100);
      window.addEventListener("focus", focusListener);
      window.addEventListener("blur", blurListener);
      window.addEventListener("resize", updateScreenDimensions);
    }

    return () => {
      dimensionsSubscription?.remove();
      appStateSubscription?.remove();
      clearInterval(intervalCheck);

      if (isWeb && window) {
        window.removeEventListener("focus", focusListener);
        window.removeEventListener("blur", blurListener);
        window.removeEventListener("resize", updateScreenDimensions);
      }
    };
  }, [appState, updateScreenDimensions, isWeb]);

  // 반응형 레이아웃 계산 - 폴더블 폰 고려
  const getResponsiveLayout = () => {
    const { width, height } = screenData;
    const isTablet = width > 768;
    const isLandscape = width > height;
    const isFoldable = width > 600 && width < 900; // 폴더블 폰 중간 상태 감지

    // 그리드 컬럼 수 계산
    let numColumns = 2;
    if (isWeb) {
      if (width > 1200) numColumns = 4;
      else if (width > 768) numColumns = 3;
    } else if (isFoldable) {
      // 폴더블 폰 특별 처리
      numColumns = isLandscape ? 4 : 3;
    } else if (isTablet) {
      numColumns = isLandscape ? 4 : 3;
    } else if (width > 400) {
      // 큰 폰 화면
      numColumns = isLandscape ? 3 : 2;
    }

    // 카드 크기 계산 (최소 패딩으로 화면 최대 활용)
    const horizontalPadding = isFoldable || isTablet ? 24 : 16; // 패딩 최소화
    const cardSpacing = isFoldable || isTablet ? 12 : 8; // 간격 최소화
    const cardWidth =
      (width - horizontalPadding - cardSpacing * (numColumns - 1)) / numColumns;

    // 썸네일 높이 계산 (16:9 비율)
    const thumbnailHeight = Math.max((cardWidth * 9) / 16, 80); // 최소 높이 보장

    // 호리즌탈 스크롤 카드 크기 (타입별 섹션용)
    let horizontalCardWidth = 160;
    if (isFoldable) horizontalCardWidth = 220;
    else if (isTablet) horizontalCardWidth = 200;
    else if (width > 400) horizontalCardWidth = 180;

    const horizontalThumbnailHeight = (horizontalCardWidth * 9) / 16;

    return {
      width,
      height,
      isTablet,
      isLandscape,
      isFoldable,
      numColumns,
      cardWidth,
      thumbnailHeight,
      horizontalCardWidth,
      horizontalThumbnailHeight,
      maxWidth: isWeb ? Math.min(width, 1200) : width,
    };
  };

  const layout = getResponsiveLayout();

  // Get unique types
  const type = video?.map((item) => item.type);
  const uniqueTypes = [...new Set(type)];

  // Filter videos based on search and selected type
  const filteredVideos = video?.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Group videos by type
  const groupedVideos = uniqueTypes
    .map((type) => ({
      type,
      videos: filteredVideos?.filter((item) => item.type === type) || [],
    }))
    .filter((group) => group.videos.length > 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // 반응형 컨테이너 스타일
  const containerStyle = isWeb
    ? {
      maxWidth: layout.maxWidth,
      marginHorizontal: "auto",
      minHeight: "100vh",
    }
    : {};

  // 반응형 헤더 패딩 - 최소화
  const headerPadding = layout.isFoldable
    ? "px-4"
    : layout.isTablet
      ? "px-4"
      : "px-3";
  const contentPadding = layout.isFoldable
    ? "px-3"
    : layout.isTablet
      ? "px-3"
      : "px-2";

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">영상을 불러오는 중...</Text>
          {/* 디버그 정보 (개발 시에만) */}
          {__DEV__ && (
            <Text className="mt-2 text-xs text-gray-400">
              화면: {screenData.width}x{screenData.height}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header Section - 높이 최소화 */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        className={`${headerPadding} pt-2 pb-4`}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text
            className={`${layout.isFoldable || layout.isTablet ? "text-2xl" : "text-xl"
              } font-bold text-white`}
          >
            영상 갤러리
          </Text>
          <TouchableOpacity className="p-1">
            <Ionicons
              name="notifications-outline"
              size={layout.isFoldable || layout.isTablet ? 26 : 22}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar - 높이 최소화 */}
        <View className="bg-white/20 rounded-xl px-3 py-2 flex-row items-center">
          <Ionicons
            name="search"
            size={18}
            color="white"
            style={{ marginRight: 8 }}
          />
          <TextInput
            className={`flex-1 text-white ${layout.isFoldable || layout.isTablet ? "text-base" : "text-sm"
              }`}
            placeholder="영상 검색..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={{ width: 20, marginLeft: 8 }}>
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="white" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      {/* Type Filter - 높이와 패딩 최소화 */}
      <View
        className={`${contentPadding} py-2 bg-white border-b border-gray-100`}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${selectedType === "all" ? "bg-blue-500" : "bg-gray-100"
                }`}
              onPress={() => setSelectedType("all")}
            >
              <Text
                className={`font-medium ${layout.isTablet ? "text-base" : "text-sm"
                  } ${selectedType === "all" ? "text-white" : "text-gray-600"}`}
              >
                전체
              </Text>
            </TouchableOpacity>

            {uniqueTypes.map((type, index) => (
              <TouchableOpacity
                key={type}
                className={`px-4 py-2 rounded-full ${selectedType === type ? "bg-blue-500" : "bg-gray-100"
                  }`}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  className={`font-medium ${layout.isTablet ? "text-base" : "text-sm"
                    } ${selectedType === type ? "text-white" : "text-gray-600"}`}
                >
                  {type} ({video?.filter((item) => item.type === type).length})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Video Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={!isWeb}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredVideos && filteredVideos.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons
              name="videocam-off-outline"
              size={layout.isTablet ? 80 : 64}
              color="#9CA3AF"
            />
            <Text
              className={`text-gray-500 ${layout.isTablet ? "text-xl" : "text-lg"
                } mt-4`}
            >
              검색 결과가 없습니다
            </Text>
            <Text
              className={`text-gray-400 text-center mt-2 px-8 ${layout.isTablet ? "text-base" : "text-sm"
                }`}
            >
              다른 검색어를 시도하거나 새로운 영상을 추가해보세요
            </Text>
          </View>
        ) : (
          <View className={contentPadding}>
            {selectedType === "all" ? (
              // Show grouped by type - 호리즌탈 스크롤
              groupedVideos.map((group, groupIndex) => (
                <View key={group.type} className="mb-4">
                  {/* Section Header - 높이 최소화 */}
                  <View className="flex-row items-center mb-2 mr-2">
                    <Text
                      className={`${layout.isFoldable || layout.isTablet
                        ? "text-lg"
                        : "text-base"
                        } font-bold text-gray-800`}
                    >
                      {group.type}
                    </Text>
                    <View className="bg-blue-100 ml-2 px-2 py-0.5 rounded-full">
                      <Text
                        className={`text-blue-600 ${layout.isFoldable || layout.isTablet
                          ? "text-sm"
                          : "text-xs"
                          } font-medium`}
                      >
                        {group.videos.length}개
                      </Text>
                    </View>
                  </View>

                  {/* Video Horizontal List - 간격 최소화 */}
                  <FlatList
                    horizontal
                    data={group.videos}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 8 }}
                    renderItem={({ item }) => (
                      <Link href={`video/${item.id}`} asChild>
                        <Pressable style={{ marginRight: 8 }}>
                          <View className="bg-gray-300 rounded-lg shadow-sm overflow-hidden">
                            <Image
                              source={{
                                uri: item.thumbnail.replace(
                                  "http://",
                                  "https://"
                                ),
                              }}
                              className="bg-gray-200"
                              style={{
                                width: layout.horizontalCardWidth,
                                height: layout.horizontalThumbnailHeight,
                              }}
                              resizeMode="cover"
                            />
                            {/* Play Button Overlay */}
                            <View className="absolute inset-0 justify-center items-center">
                              <View className="bg-black/50 rounded-full p-2">
                                <Ionicons
                                  name="play"
                                  size={
                                    layout.isFoldable || layout.isTablet
                                      ? 20
                                      : 16
                                  }
                                  color="white"
                                />
                              </View>
                            </View>

                            {/* Video Info - 패딩 최소화 */}
                            <View
                              className="p-2"
                              style={{ width: layout.horizontalCardWidth }}
                            >
                              <Text
                                className={`font-medium text-gray-800 ${layout.isFoldable || layout.isTablet
                                  ? "text-sm"
                                  : "text-xs"
                                  }`}
                                numberOfLines={2}
                              >
                                {item.title || `영상 ${item.id}`}
                              </Text>
                              {/* {item.duration && (
                                <Text
                                  className={`text-gray-500 ${
                                    layout.isFoldable || layout.isTablet
                                      ? "text-xs"
                                      : "text-xs"
                                  } mt-0.5`}
                                >
                                  {item.duration}
                                </Text>
                              )} */}
                            </View>
                          </View>
                        </Pressable>
                      </Link>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                  />
                </View>
              ))
            ) : (
              // Show grid for selected type - 반응형 그리드
              <View className="pt-2">
                <FlatList
                  data={filteredVideos}
                  numColumns={layout.numColumns}
                  key={layout.numColumns} // numColumns 변경 시 리렌더링
                  columnWrapperStyle={
                    layout.numColumns > 1
                      ? {
                        justifyContent: "space-between",
                        paddingHorizontal: 0,
                      }
                      : null
                  }
                  renderItem={({ item, index }) => (
                    <Link href={`video/${item.id}`} asChild>
                      <Pressable
                        style={{
                          width: layout.cardWidth,
                          marginBottom: 8,
                          marginRight:
                            layout.numColumns > 1 &&
                              (index + 1) % layout.numColumns !== 0
                              ? layout.isFoldable || layout.isTablet
                                ? 6
                                : 4
                              : 0,
                        }}
                      >
                        <View className="bg-gray-300 rounded-lg shadow-sm overflow-hidden">
                          <Image
                            source={{
                              uri: item.thumbnail.replace(
                                "http://",
                                "https://"
                              ),
                            }}
                            className="bg-gray-200"
                            style={{
                              width: "100%",
                              height: layout.thumbnailHeight,
                            }}
                            resizeMode='cover'
                          />
                          {/* Play Button Overlay */}
                          <View className="absolute inset-0 justify-center items-center">
                            <View className="bg-black/50 rounded-full p-2">
                              <Ionicons
                                name="play"
                                size={
                                  layout.isFoldable || layout.isTablet ? 24 : 20
                                }
                                color="white"
                              />
                            </View>
                          </View>

                          {/* Video Info - 패딩 최소화 */}
                          <View className="p-2">
                            <Text
                              className={`font-medium text-gray-800 ${layout.isFoldable || layout.isTablet
                                ? "text-sm"
                                : "text-xs"
                                }`}
                              numberOfLines={2}
                            >
                              {item.title || `영상 ${item.id}`}
                            </Text>
                            {/* {item.duration && (
                              <Text
                                className={`text-gray-500 ${
                                  layout.isFoldable || layout.isTablet
                                    ? "text-xs"
                                    : "text-xs"
                                } mt-0.5`}
                              >
                                {item.duration}
                              </Text>
                            )} */}
                          </View>
                        </View>
                      </Pressable>
                    </Link>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button - 크기 최소화 */}
      <View
        className={`absolute bottom-4 right-4 ${isWeb ? "sticky bottom-4" : ""
          }`}
      >
        <TouchableOpacity
          className={`${layout.isFoldable || layout.isTablet ? "w-12 h-12" : "w-11 h-11"
            } bg-blue-500 rounded-full shadow-lg items-center justify-center`}
          onPress={() => router.push("/video/create")}
          style={{
            boxShadow: "0px 2px 4px rgba(59, 130, 246, 0.3)",
            elevation: 6,
          }}
        >
          <Ionicons
            name="add"
            size={layout.isFoldable || layout.isTablet ? 24 : 20}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className={`${layout.isFoldable || layout.isTablet ? "w-12 h-12" : "w-11 h-11"
          } bg-blue-500 rounded-full shadow-lg items-center justify-center`}
        onPress={() => router.push("/video/thumbnailtest")}
        style={{
          boxShadow: "0px 2px 4px rgba(59, 130, 246, 0.3)",
          elevation: 6,
        }}
      >
        <Ionicons
          name="add"
          size={layout.isFoldable || layout.isTablet ? 24 : 20}
          color="black"
        />
      </TouchableOpacity>
      {/* Bottom Safe Area for iOS - 높이 최소화 */}
      {Platform.OS === "ios" && <View className="h-2 bg-gray-50" />}
    </SafeAreaView>
  );
};

export default Video;
