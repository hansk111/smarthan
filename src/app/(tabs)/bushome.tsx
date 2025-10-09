import { BusStopCard, EmptyState, Loading, SearchBar } from "@/components/bus";
import { BusRouteDetailScreen } from "@/components/bus/screens/BusRouteDetailScreen";
import { BusStopDetailScreen } from "@/components/bus/screens/BusStopDetailScreen";
import {
  useGetNearbyBusStopsQuery,
  useLazyGetBusRoutesQuery,
  useLazyGetBusStopsQuery,
} from "@/store/bus/busApi";
import {
  useDeleteBusStationMutation,
  useLazyGetAllBusStationQuery,
} from "@/store/bus/BusApiSlice";
import { addRecentSearch, setCurrentLocation } from "@/store/bus/busSlice";
import type { RootState } from "@/store/store";
import type { BusRoute, BusStop } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Bushome = () => {
  const dispatch = useDispatch();
  const { currentLocation, recentSearches } = useSelector(
    (state: RootState) => state.bus
  );

  const [searchResults, setSearchResults] = useState<(BusStop | BusRoute)[]>(
    []
  );
  const [searchType, setSearchType] = useState<"stop" | "route" | "favority">(
    "stop"
  );
  const [isSearching, setIsSearching] = useState(false);

  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [currentView, setCurrentView] = useState<
    "home" | "stopDetail" | "routeDetail"
  >("home");

  const [searchFocused, setSearchFocused] = useState(false);

  const [deleteStation] = useDeleteBusStationMutation();

  const handleDeleteStation = (id: number) => {
    deleteStation(id)
      .unwrap()
      .then(() => {
        console.log("favoriaty deleted");
        handleFavorityButtonClick();
      })
      .catch(() => {
        console.log("failed to delete favoriaty");
      });
  };

  const handleStopPress = (stop: BusStop) => {
    setSelectedStop(stop);
    setCurrentView("stopDetail");
  };

  // console.log("selectedStop", selectedStop);

  const handleRoutePress = (route: BusRoute) => {
    setSelectedRoute(route);
    setCurrentView("routeDetail");
  };

  // console.log("selectedRoute", selectedRoute);

  const handleBackFromDetail = () => {
    setCurrentView("home");
    setSelectedStop(null);
    setSelectedRoute(null);
  };

  const handleStopPressFromRoute = (stopId: number) => {
    // 노선 상세에서 정류장을 선택했을 때
    // 근처 정류장과 검색 결과에서 찾기
    console.log("stopId", stopId);
    // console.log("nearbyStops", nearbyStops);

    let stop = nearbyStops?.find((s: BusStop) => s.stationId === stopId);
    // console.log("stop", stop);
    if (!stop) {
      // Type guard function to check if item is BusStop
      const isBusStop = (item: BusStop | BusRoute): item is BusStop => {
        return "stationName" in item && "stationId" in item;
      };

      // Use the type guard in find
      stop = searchResults.find(
        (item): item is BusStop => isBusStop(item) && item.stationId === stopId
      );
    }
    if (stop) {
      setSelectedStop(stop);
      setCurrentView("stopDetail");
    }
  };

  const {
    data: nearbyStops = [],
    isLoading: isLoadingNearby,
    refetch: refetchNearby,
  } = useGetNearbyBusStopsQuery(
    currentLocation
      ? { x: currentLocation.longitude, y: currentLocation.latitude }
      : { x: 127.111209047, y: 37.394726159 },
    { skip: !currentLocation }
  );

  // console.log('nearbyStops', nearbyStops)
  const [searchStops] = useLazyGetBusStopsQuery();
  const [searchRoutes] = useLazyGetBusRoutesQuery();
  const [searchfavority] = useLazyGetAllBusStationQuery();

  // console.log("searchResults", searchResults);

  // 위치 권한 요청 및 현재 위치 가져오기
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "위치 권한 필요",
          "주변 정류장을 찾기 위해 위치 권한이 필요합니다.",
          [{ text: "확인" }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      dispatch(
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
      );
    } catch (error: any) {
      console.error("위치 가져오기 실패:", error);
      Alert.alert(
        "위치오류",
        error.message || "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  //즐겨찾기버튼 클릭시
  const handleFavorityButtonClick = async () => {
    try {
      const result_raw = await searchfavority().unwrap();
      const result = Array.isArray(result_raw) ? result_raw : [result_raw];
      setSearchResults(result);
    } catch (error: any) {
      Alert.alert("즐겨찾기 가져오기 실패");
      setSearchResults([]);
    }
  };

  console.log("searchResults", searchResults);
  // 검색 함수
  const handleSearch = async (query: string) => {
    console.log("handleSearch");
    if (!query.trim()) {
      console.log("검색어 없음");
      // setSearchResults([]);
      return;
    }
    console.log(!query.trim());
    setIsSearching(true);
    dispatch(addRecentSearch(query));

    try {
      if (searchType === "stop") {
        const result_raw = await searchStops({ keyword: query }).unwrap();
        const result = Array.isArray(result_raw) ? result_raw : [result_raw];
        setSearchResults(result);
      } else if (searchType === "route") {
        const result_raw = await searchRoutes({ keyword: query }).unwrap();
        const result = Array.isArray(result_raw) ? result_raw : [result_raw];
        setSearchResults(result);
      } else {
        const result_raw = await searchfavority().unwrap();
        const result = Array.isArray(result_raw) ? result_raw : [result_raw];
        setSearchResults(result);
      }
    } catch (error: any) {
      console.error("검색 실패:", error);
      Alert.alert(
        "검색오류",
        error.message || "알 수 없는 오류가 발생했습니다."
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
  };

  // console.log("searchResults", searchResults);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return <Loading message="검색 중..." />;
    }

    if (searchResults.length === 0) {
      return null;
    }

    return (
      <View className="mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-3 px-4">
          검색 결과 ({searchResults.length}개)
        </Text>
        {searchResults.map((item, index) => {
          if ("stationName" in item) {
            // 버스 정류장
            const stop = item as BusStop;
            const distance = currentLocation
              ? calculateDistance(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  stop.y,
                  stop.x
                )
              : undefined;

            return (
              <View key={`search-${stop.stationId}`} className="px-4">
                {searchType === "favority" && (
                  <View className="items-end justify-end">
                    <Pressable
                      className="border m-1 px-4 py-1 rounded-lg items-center p-0.75 bg-warning-300"
                      onPress={() => stop.id && handleDeleteStation(stop.id)}
                    >
                      <Text className="text-black">삭제</Text>
                    </Pressable>
                  </View>
                )}
                <BusStopCard
                  // key={stop.stationId}
                  stop={stop}
                  onPress={() => handleStopPress(stop)}
                  distance={distance}
                  showDistance={!!distance}
                />
              </View>
            );
          } else {
            // 버스 노선
            const route = item as BusRoute;
            return (
              <TouchableOpacity
                key={`search-${route.routeId}`}
                className="bg-success-100 rounded-lg p-4 mb-3 mx-4 border border-gray-100 shadow-sm"
                onPress={() => handleRoutePress(route)}
              >
                <View className="flex-row items-center ">
                  <View className="w-10 h-8 bg-blue-500 rounded items-center justify-center mr-3">
                    <Text className="text-white font-bold text-xs">
                      {route.routeName}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {route.routeName}번
                    </Text>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-900">
                        {route.routeTypeName}
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {route.adminName}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }
        })}
      </View>
    );
  };

  // 조건부 렌더링
  if (currentView === "stopDetail" && selectedStop) {
    return (
      <BusStopDetailScreen stop={selectedStop} onBack={handleBackFromDetail} />
    );
  }

  if (currentView === "routeDetail" && selectedRoute) {
    return (
      <BusRouteDetailScreen
        currentLocation={currentLocation}
        route={selectedRoute}
        onBack={handleBackFromDetail}
        onStopPress={handleStopPressFromRoute}
        calculateDistance={calculateDistance}
      />
    );
  }

  const getDropdownHeight = () => {
    if (!searchFocused || recentSearches.length === 0) return 0;

    const headerHeight = 48; // 헤더 높이
    const itemHeight = 48; // 각 아이템 높이
    const maxHeight = 200; // FlatList maxHeight
    const calculatedHeight = headerHeight + recentSearches.length * itemHeight;
    return Math.min(calculatedHeight, maxHeight + headerHeight) + 8; // 여백 포함
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white px-4 py-3 item">
        <Text className="text-xl text-center font-bold text-gray-800 mb-4">
          정류장 혹은 노선을 검색하세요.
        </Text>

        {/* 검색 타입 선택 */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-l-lg border ${
              searchType === "stop"
                ? "bg-primary-300 border-primary-500"
                : "bg-gray-100 border-gray-500"
            }`}
            onPress={() => {
              setSearchType("stop");
              setSearchResults([]);
              setIsSearching(false);
            }}
          >
            <Text
              className={`text-center font-medium ${
                searchType === "stop" ? "text-black text-xl" : "text-gray-700"
              }`}
            >
              정류장
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 px-4 border ${
              searchType === "route"
                ? "bg-primary-300 border-primary-500"
                : "bg-gray-100 border-gray-500"
            }`}
            onPress={() => {
              setSearchType("route");
              setSearchResults([]);
              setIsSearching(false);
            }}
          >
            <Text
              className={`text-center font-medium ${
                searchType === "route" ? "text-black text-xl" : "text-gray-700"
              }`}
            >
              노선
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-r-lg border ${
              searchType === "favority"
                ? "bg-primary-300 border-primary-500"
                : "bg-gray-100 border-gray-500"
            }`}
            onPress={() => {
              setSearchType("favority");
              handleFavorityButtonClick();
              setIsSearching(false);
            }}
          >
            <Text
              className={`text-center font-medium ${
                searchType === "favority"
                  ? "text-black text-xl"
                  : "text-gray-700"
              }`}
            >
              즐겨찾기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 검색바 */}
        <SearchBar
          placeholder={
            searchType === "stop"
              ? "정류장명을 입력하세요" // If searchType is "stop"
              : searchType === "route"
              ? "노선번호를 입력하세요" // Else if searchType is "route"
              : "검색을 클릭하세요" // Else (for any other searchType, like "favorite")
          }
          onSearch={handleSearch}
          onClear={handleClearSearch}
          recentSearches={recentSearches}
          onSelectRecent={handleSearch}
          onFocusChange={setSearchFocused}
        />
      </View>

      {/* 검색 결과 영역 - 포커스 상태에 따라 위치 조정 */}
      <View
        className="flex-1"
        style={{
          marginTop: getDropdownHeight(), // 동적으로 마진 조정
          // transition: 'margin-top 0.2s ease', // 부드러운 애니메이션 (웹에서만 작동)
        }}
      >
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isLoadingNearby}
              onRefresh={refetchNearby}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* 검색 결과 */}
          {searchResults.length > 0 ? (
            renderSearchResults()
          ) : (
            <>
              {/* 내 위치 버튼 */}
              <View className="px-4 py-3">
                <TouchableOpacity
                  className="bg-primary-100 rounded-lg p-4 border border-primary-300"
                  onPress={requestLocationPermission}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="location" size={20} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-800">
                        내 위치 주변 정류장
                      </Text>
                      <Text className="text-sm text-gray-600">
                        현재 위치 기준으로 가까운 정류장을 찾아보세요
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View className="border-b border-gray-300 mt-3" />
              {/* 주변 정류장 */}
              {currentLocation && (
                <View className="px-4 mt-5">
                  <Text className="text-center text-lg font-bold text-gray-800 mb-3">
                    주변 정류장
                  </Text>
                  {isLoadingNearby ? (
                    <Loading message="주변 정류장을 찾는 중..." />
                  ) : (nearbyStops ?? []).length > 0 ? (
                    nearbyStops.map((stop: BusStop) => {
                      const distance = calculateDistance(
                        currentLocation.latitude,
                        currentLocation.longitude,
                        stop.y,
                        stop.x
                      );
                      return (
                        <View key={stop.stationId} className="mb-3">
                          <Button
                            title={stop.stationName + " 즐겨찾기 추가"}
                            onPress={() => console.log("버튼 클릭", stop)}
                          />
                          <BusStopCard
                            // key={stop.stationId}
                            stop={stop}
                            onPress={() => handleStopPress(stop)}
                            distance={distance}
                            showDistance={true}
                          />
                        </View>
                      );
                    })
                  ) : (
                    <EmptyState
                      title="주변에 정류장이 없습니다"
                      subtitle="다른 지역을 검색해보세요"
                    />
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default Bushome;
