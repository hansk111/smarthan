import { Loading, SearchBar } from "@/components/bus";
import { addRecentSearch, setCurrentLocation } from "@/store/bus/busSlice";
import type { RootState } from "@/store/store";
import { useGetStreetNameQuery } from "@/store/weather/streetmapApi";
// import { useGetStreetNameQuery } from "@/store/weather/streetmapApi";
import {
  useGetCurrentAndForecastQuery,
  useGetWeatherOverviewQuery,
  useLazyGetGeocoordQuery,
} from "@/store/weather/weatherApi";
import {
  useDeleteWeatherPositionMutation,
  useGetAllWeatherPositionQuery,
  useSaveWeatherPositionMutation,
} from "@/store/weather/weatherApiSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Polygon } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

const Weather = () => {
  const dispatch = useDispatch();
  const { currentLocation, recentSearches } = useSelector(
    (state: RootState) => state.bus
  );

  const caltoday = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const caltodayhour = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const hour = date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "numeric",
      hour12: false, // 24시간 형식
    });

    return hour.replace(/[^0-9]/g, ""); // 숫자만 추출
  };

  const caltodayminute = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      // weekday: "long",
      // day: "numeric",
      // hour: "numeric",
      minute: "numeric",
    });
  };

  const caltoday3 = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      weekday: "long",
      day: "numeric",
    });
  };

  const caltoday_date_hour = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      weekday: "short",
      // day: "numeric",
      hour: "numeric",
      hour12: false, // 24시간 형식
    });
  };

  const {
    data: currentweatherandforecast,
    refetch: refetchCurrentWeatherAndForecast,
  } = useGetCurrentAndForecastQuery(
    {
      lat: currentLocation?.latitude || 37.55,
      lon: currentLocation?.longitude || 126.98,
    },
    {
      pollingInterval: 6000000, //60분
    }
  );

  const { data: weather_overview, refetch: refetchWeatherOverview } =
    useGetWeatherOverviewQuery(
      {
        lat: currentLocation?.latitude || 37.55,
        lon: currentLocation?.longitude || 126.98,
      },
      {
        pollingInterval: 6000000, //60분
      }
    );

  const { data: streetName, refetch: refetchStreetName } =
    useGetStreetNameQuery({
      lat: currentLocation?.latitude || 37.55,
      lon: currentLocation?.longitude || 126.98,
    });

  // console.log("streetName", streetName);

  const { data: weatherpositions } = useGetAllWeatherPositionQuery();
  const [saveWeatherPosition] = useSaveWeatherPositionMutation();
  const [deleteWeatherPosition] = useDeleteWeatherPositionMutation();
  console.log("weatherpositions", weatherpositions);

  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");

  const [searchGeocoord] = useLazyGetGeocoordQuery();

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isOverview, setIsOverview] = useState(false);
  const [isDayHourview, setIsDayHourview] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleSwitch = () =>
    setIsDayHourview((previousState) => !previousState);

  // 시계
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul",
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      const timeStr = now.toLocaleTimeString("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        // second: '2-digit',
      });

      setDate(dateStr);
      setTime(timeStr);
    };

    updateTime(); // 초기값 설정
    const interval = setInterval(updateTime, 60000); // 60초마다 갱신

    return () => clearInterval(interval); // 언마운트 시 정리
  }, []);

  // 검색색
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      console.log("검색어 없음");
      return;
    }
    console.log(query.trim());
    setIsSearching(true);
    dispatch(addRecentSearch(query));

    try {
      const result_raw = await searchGeocoord({ query: query }).unwrap();
      const result = Array.isArray(result_raw) ? result_raw : [result_raw];
      console.log(result);
      setSearchResults(result);
    } catch (error: any) {
      console.error("검색 실패:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      console.log("길이", searchResults?.length);
    }
  };

  // 검색 결과 클릭 핸들러
  const handleOnpress = async (item: any) => {
    dispatch(
      setCurrentLocation({
        latitude: item.lat,
        longitude: item.lon,
      })
    );
    setSearchResults([]);
  };

  const handletogglefavorite = (lat: number, lon: number) => {
    if (!weatherpositions) return;
    console.log("lat", lat);
    console.log("lon", lon);
    // console.log("weatherpositions", weatherpositions);

    const existingPosition = weatherpositions.find(
      (position: any) =>
        parseFloat(position.lat.toFixed(4)) === parseFloat(lat.toFixed(4)) &&
        parseFloat(position.lon.toFixed(4)) === parseFloat(lon.toFixed(4))
    );

    if (existingPosition) {
      deleteWeatherPosition(existingPosition.id)
        .unwrap()
        .then(() => {
          console.log("삭제");
        });
    } else {
      const formData = new FormData();
      formData.append("lat", lat.toString());
      formData.append("lon", lon.toString());

      console.log("저장");
      // saveWeatherPosition({ lat, lon });
    }

    // dispatch(
    //   setCurrentLocation({
    //     latitude: weatherpositions[index].lat,
    //     longitude: weatherpositions[index].lon,
    //   })
    // );
    // setSearchResults([]);
  };

  const handleSaveFavorite = (item: any) => {
    const formData = new FormData();
    formData.append("lat", item.lat);
    formData.append("lon", item.lon);
    formData.append("name", item.name);
    formData.append("country", item.country);
    formData.append("local_name", item.local_names.ko);

    saveWeatherPosition(formData)
      .unwrap()
      .then(() => {
        console.log("즐겨찾기 저장");
      });
  };

  const handleOnpressPosition = (position: any) => {
    dispatch(
      setCurrentLocation({
        latitude: position.lat,
        longitude: position.lon,
      })
    );
    // setSearchResults([]);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
  };

  // 검색 결과 랜더링
  const renderSearchResults = () => {
    if (isSearching) {
      return <Loading message="검색 중..." />;
    }

    if (searchResults?.length === 0) {
      return null;
    }
    return (
      <View className="mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-3 px-4">
          🔍 검색 결과 ({searchResults?.length}개)
        </Text>

        {/* 도움말 안내 텍스트 */}
        <Text className="text-sm text-gray-500 italic px-4 mb-3">
          결과를 클릭하면 해당 지역의 날씨를 확인할 수 있어요 ☁️
        </Text>

        {searchResults?.length > 0 &&
          searchResults.map((item, index) => {
            if ("name" in item) {
              return (
                <View key={`search-${index}`} className="px-4 flex-row">
                  <Pressable
                    // className="bg-yellow-100 border border-yellow-300 rounded-xl px-4 py-3 mb-3 shadow-sm"
                    className={`rounded-xl px-4 py-3 mb-3 shadow-sm ${
                      item.country === "KR"
                        ? "bg-yellow-100 border border-yellow-300"
                        : "bg-blue-100 border border-blue-300"
                    }`}
                    onPress={() => handleOnpress(item)}
                  >
                    <View className="flex-wrap items-center justify-between">
                      <View className="">
                        <Text className="text-base font-semibold text-gray-800">
                          📍 {item.name}
                          {item.local_names?.ko && ` (${item.local_names.ko})`}
                        </Text>
                        <Text className="text-sm text-gray-600 mt-1">
                          🌐 국가: {item.country}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          📌 위도: {item.lat}, 경도: {item.lon}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => handleSaveFavorite(item)}>
                    <Text>즐겨찾기</Text>
                  </Pressable>
                </View>
              );
            }
          })}
      </View>
    );
  };

  const getDropdownHeight = () => {
    if (!searchFocused || recentSearches.length === 0) return 0;

    const headerHeight = 48; // 헤더 높이
    const itemHeight = 48; // 각 아이템 높이
    const maxHeight = 200; // FlatList maxHeight
    const calculatedHeight = headerHeight + recentSearches.length * itemHeight;
    return Math.min(calculatedHeight, maxHeight + headerHeight) + 8; // 여백 포함
  };

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
      // refetchWeather();
      refetchCurrentWeatherAndForecast();
      refetchWeatherOverview();
      refetchStreetName();
    } catch (error: any) {
      console.error("위치 가져오기 실패:", error);
      Alert.alert(
        "위치오류",
        error.message || "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  const getUviLevel = (uvi: number) => {
    if (uvi < 3) return "낮음";
    if (uvi < 6) return "보통";
    if (uvi < 8) return "높음";
    if (uvi < 11) return "매우 높음";
    return "위험";
  };

  // console.log("currentweatherandforecast", currentweatherandforecast);

  return (
    <View className="flex-1 bg-blue-200 *:px-4 pt-4">
      <View className="flex-row items-center justify-around mb-4 px-2">
        {/* 타이틀 */}
        <Text className="text-2xl font-bold text-blue-900">🌦️ 날씨 정보</Text>

        {/* 위치 버튼 */}
        <TouchableOpacity onPress={requestLocationPermission}>
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center shadow-md ml-2">
            <Ionicons name="location" size={28} color="#10B981" />
          </View>
        </TouchableOpacity>

        {/* 보기 전환 스위치 */}
        <View className="flex-row items-center ml-4">
          <Text className="text-sm text-gray-700 mr-2">
            {isDayHourview ? "닫기" : "일시/검색"}
          </Text>
          <Switch
            trackColor={{ false: "#d1d5db", true: "#60a5fa" }}
            thumbColor={isDayHourview ? "#facc15" : "#f3f4f6"}
            value={isDayHourview}
            onValueChange={toggleSwitch}
          />
        </View>
      </View>

      {isDayHourview && (
        <View className="w-full mb-2">
          {/* 날짜 카드 */}
          <View className="bg-white rounded-xl justify-center items-center shadow-md p-2 mb-2">
            <Text className="text-4xl font-bold text-blue-500">📅 {date}</Text>
          </View>

          {/* 시간 카드 */}
          <View className="bg-white rounded-xl justify-center items-center shadow-md p-2 mb-2">
            <Text className="text-4xl font-bold text-blue-500 tracking-widest">
              🕒 {time}
            </Text>
          </View>
          {/* 검색 바 */}
          <View className="p-2">
            <SearchBar
              placeholder="도시명을 입력하세요"
              onSearch={handleSearch}
              onClear={handleClearSearch}
              recentSearches={recentSearches}
              onSelectRecent={handleSearch}
              onFocusChange={setSearchFocused}
            />
          </View>
          <View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
              {weatherpositions?.map((position, index) => (
                <TouchableOpacity
                  onPress={() => handleOnpressPosition(position)}
                  key={index}
                  className="bg-slate-300 rounded-md items-center pl-2 pr-2 ml-2 mr-2 mb-2 flex-row justify-between"
                >
                  {/* 온도 */}
                  <Text className="text-base text-blue-700 font-semibold">
                    {position.local_name ? position.local_name : position.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      <View
        className="flex-1 w-full bg-gray-200"
        style={{
          marginTop: getDropdownHeight(), // 동적으로 마진 조정
          // transition: 'margin-top 0.2s ease', // 부드러운 애니메이션 (웹에서만 작동)
        }}
      >
        {/* <View className="w-full h-[1px] bg-gradient-to-r from-blue-400 via-blue-700 to-blue-400 mb-2" /> */}
        <ScrollView className="flex-1 w-full mb-2 mt-2">
          {searchResults?.length > 0 ? (
            renderSearchResults()
          ) : (
            <View className="bg-white rounded-2xl shadow-lg p-5 w-full mb-4">
              {/* 도시 이름 및 현재 날씨 */}
              <View className="flex-1">
                {/* <Ionicons name="today" size={24} color="blue" /> */}
                <View className="flex-row justify-between items-center">
                  <Text className="ml-4 text-xl font-bold text-gray-800 mb-3">
                    📍 오늘 {streetName?.address?.city} 날씨
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (
                        currentweatherandforecast?.lat &&
                        currentweatherandforecast?.lon
                      ) {
                        handletogglefavorite(
                          currentweatherandforecast.lat,
                          currentweatherandforecast.lon
                        );
                      }
                    }}
                    className="p-2"
                  >
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={24}
                      color={isFavorite ? "#EF4444" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsOverview(!isOverview)}
                    className="bg-blue-500 px-4 py-1 rounded-xl mb-2 self-end"
                  >
                    <Text className="text-white font-semibold">
                      {!isOverview ? "설명" : "닫기"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="w-full h-[1px] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 mb-2" />
                <View className="flex-1 justify-center items-center">
                  <Text className="text-xs  text-gray-800">
                    {streetName?.display_name}
                  </Text>
                </View>
                <View className="mt-2 w-full h-[1px] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 mb-2" />
              </View>
              {isOverview && (
                <>
                  <View>
                    <Text className="text-md text-gray-500">
                      {weather_overview?.weather_overview}
                    </Text>
                  </View>
                  <View className="w-full h-[1px] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 mb-2 mt-2" />
                </>
              )}

              {/* 온도 및 습도 */}
              <View className="mb-4">
                <Text className="text-xl font-semibold text-blue-700 mb-1">
                  🌡️ 온도 : {currentweatherandforecast?.current?.temp}°C (체감 :{" "}
                  {currentweatherandforecast?.current?.feels_like}°C)
                </Text>
                <Text className="text-lg text-gray-700">
                  💧 습도: {currentweatherandforecast?.current?.humidity}%
                </Text>
                <Text className="text-lg text-gray-700">
                  🌥️ 흐림: {currentweatherandforecast?.current?.clouds}%
                </Text>
                <Text className="text-lg text-gray-700">
                  ☀️ 자외선 지수: {currentweatherandforecast?.current?.uvi} (
                  {getUviLevel(currentweatherandforecast?.current?.uvi || 0)})
                </Text>
              </View>

              {/* 일출/일몰 시계 */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-1 items-center">
                  <Text className="text-sm text-gray-500 mb-1">
                    🌅 일출:{" "}
                    {caltoday(currentweatherandforecast?.current?.sunrise || 0)}
                  </Text>
                  <Clock
                    hour={caltodayhour(
                      currentweatherandforecast?.current?.sunrise || 0
                    )}
                    minute={caltodayminute(
                      currentweatherandforecast?.current?.sunrise || 0
                    )}
                  />
                </View>
                {/* <View
                  className="border"
                  style={{ width: 240, height: 240 }}
                >
                  <WindArrow
                    deg={weather?.wind.deg}
                    speed={weather?.wind.speed}
                  />
                </View> */}
                <View className="flex-1 items-center">
                  <Text className="text-sm text-gray-500 mb-1">
                    🌇 일몰:{" "}
                    {caltoday(currentweatherandforecast?.current?.sunset || 0)}
                  </Text>
                  <Clock
                    hour={caltodayhour(
                      currentweatherandforecast?.current?.sunset || 0
                    )}
                    minute={caltodayminute(
                      currentweatherandforecast?.current?.sunset || 0
                    )}
                  />
                </View>
              </View>

              {/* 날씨 아이콘 및 설명 */}
              <View className="items-center">
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${
                      currentweatherandforecast?.current?.weather?.[0]?.icon ||
                      "default"
                    }@4x.png`,
                  }}
                  style={{ width: 120, height: 120 }}
                  resizeMode="contain"
                  className="rounded-full bg-slate-300 border border-gray-300"
                />

                <Text className="text-base text-gray-700 mt-2">
                  {
                    currentweatherandforecast?.current?.weather?.[0]
                      ?.description
                  }
                </Text>

                <Text className="text-sm text-gray-500 mt-2">
                  🕒 예보시간:{" "}
                  {caltoday(currentweatherandforecast?.current?.dt || 0)}
                </Text>
              </View>
              <View className="w-full h-[1px] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 mt-2" />
              {/* 48시간 날씨 */}
              <View className="mt-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xl font-bold text-gray-800 mb-2">
                    ⏰ 시간별 예보 (48시간)
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsHorizontal(!isHorizontal)}
                    className="bg-blue-500 px-4 py-1 rounded-xl mb-2 self-end"
                  >
                    <Text className="text-white font-semibold">
                      {isHorizontal ? "세로" : "가로"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal={isHorizontal}
                  showsHorizontalScrollIndicator={true}
                  style={isHorizontal ? {} : {}}
                >
                  {currentweatherandforecast?.hourly?.map((hour, index) => (
                    <View
                      key={index}
                      className={`bg-slate-300 rounded-md items-center ${
                        !isHorizontal
                          ? "pl-2 pr-2 mb-2 flex-row justify-between"
                          : "p-2 mr-2"
                      }`}
                    >
                      {/* 시간 */}
                      <Text className="text-base text-gray-900">
                        {caltoday_date_hour(hour.dt)}
                      </Text>

                      {/* 날씨 아이콘 */}
                      <Image
                        source={{
                          uri: `https://openweathermap.org/img/wn/${
                            hour.weather?.[0]?.icon || "default"
                          }@4x.png`,
                        }}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />

                      {/* 강수/강설 */}
                      {hour.rain?.["1h"] ? (
                        <Text className="text-base font-bold text-blue-700">
                          {hour.rain["1h"]}mm({Math.round(hour.pop * 100)}%)
                        </Text>
                      ) : (
                        <Text className="text-md text-gray-400">강수없음</Text>
                      )}
                      {hour.snow?.["1h"] ? (
                        <Text className="text-base font-bold text-blue-700">
                          {hour.snow["1h"]}mm({Math.round(hour.pop * 100)}%)
                        </Text>
                      ) : (
                        <Text className="text-md text-gray-400">적설없음</Text>
                      )}

                      {/* 온도 */}
                      <Text className="text-base text-blue-700 font-semibold">
                        {Math.round(hour.temp)}°C
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* 8일간 날씨 */}
          {searchResults?.length == 0 &&
            currentweatherandforecast?.daily?.map((day: any, index: number) => (
              <View
                key={index}
                className="bg-white rounded-2xl shadow-lg p-4 w-full mb-4"
              >
                {/* 날짜 및 제목 */}
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  📅 {caltoday3(day.dt)} 예보
                </Text>
                <Text className="text-md font-semibold text-gray-800 mb-3">
                  {day.summary}
                </Text>
                <View className="w-full h-[1px] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 mb-2" />

                {/* 날씨 정보 섹션 */}
                <View className="flex-row items-center justify-between mt-2">
                  {/* 왼쪽: 온도 및 습도 */}
                  <View className="flex-1">
                    <Text className="text-base text-gray-700 mb-1">
                      🌡️ 온도: {day.temp.day}°C
                    </Text>
                    <Text className="text-base text-gray-700 mb-1">
                      💧 습도: {day.humidity}%
                    </Text>
                    {day.rain && (
                      <Text className="text-base text-gray-700 mb-1">
                        🌧️ 비: {day.rain}mm ({Math.round(day.pop * 100)}%)
                      </Text>
                    )}

                    <Text className="text-base text-gray-700 mb-1">
                      🌥️ 흐림: {day.clouds}%
                    </Text>
                    <Text className="text-base text-gray-700 mb-1">
                      ☀️ 자외선 지수: {day?.uvi} ({getUviLevel(day?.uvi || 0)})
                    </Text>
                  </View>

                  {/* 가운데: 날씨 아이콘 */}
                  <View className="mx-4 items-center">
                    <Image
                      source={{
                        uri: `https://openweathermap.org/img/wn/${
                          day.weather?.[0]?.icon || "default"
                        }@4x.png`,
                      }}
                      style={{ width: 80, height: 80 }}
                      resizeMode="contain"
                      className="rounded-full bg-slate-300 border border-gray-300"
                    />
                    <Text className="text-base text-gray-700 text-right">
                      {day.weather?.[0]?.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Weather;

const Clock = ({
  hour,
  minute,
}: {
  hour: string | number;
  minute: string | number;
}) => {
  const hourAngle = (Number(hour) % 12) * 30 + Number(minute) * 0.5;
  const minuteAngle = Number(minute) * 6;

  return (
    <View className="flex-1 items-center justify-center">
      <Svg height="50" width="50">
        <Circle
          cx="25"
          cy="25"
          r="24"
          stroke="blue"
          strokeWidth="2"
          fill="white"
        />
        <Line
          x1="25"
          y1="25"
          x2={25 + 15 * Math.sin((Math.PI / 180) * hourAngle)}
          y2={25 - 15 * Math.cos((Math.PI / 180) * hourAngle)}
          stroke="blue"
          strokeWidth="3"
        />
        <Line
          x1="25"
          y1="25"
          x2={25 + 20 * Math.sin((Math.PI / 180) * minuteAngle)}
          y2={25 - 20 * Math.cos((Math.PI / 180) * minuteAngle)}
          stroke="gray"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

const WindArrow = ({ deg = 60, speed = 3.5 }) => {
  const angle = ((270 - deg) % 360) * (Math.PI / 180);
  const length = 40 + speed * 10;

  const x1 = 80;
  const y1 = 80;
  const x2 = x1 + length * Math.cos(angle);
  const y2 = y1 + length * Math.sin(angle);
  // console.log(x1, y1, x2, y2)
  // 화살촉 크기 및 위치 조정
  const arrowSize = 24;
  const tipX = x2;
  const tipY = y2;

  const leftX = tipX - arrowSize * Math.cos(angle - Math.PI / 6);
  const leftY = tipY - arrowSize * Math.sin(angle - Math.PI / 6);

  const rightX = tipX - arrowSize * Math.cos(angle + Math.PI / 6);
  const rightY = tipY - arrowSize * Math.sin(angle + Math.PI / 6);

  // console.log(tipX, tipY, leftX, leftY, rightX, rightY)
  return (
    <Svg height="120" width="120">
      {/* 중심점 */}
      <Circle cx={x1} cy={y1} r="3" fill="blue" />

      {/* 화살 몸통 */}
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="blue" strokeWidth="2" />

      {/* 화살촉 */}

      <Polygon
        points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
        // points={`${tipX},${tipY} 10,10 50,50`}
        fill="blue"
      />
    </Svg>
  );
};
