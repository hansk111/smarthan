import { useGetRouteStationsQuery } from "@/store/bus/busApi";
import type { BusArrival, BusStop, StationType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
interface BusArrivalCardProps {
  stop: BusStop;
  arrival: BusArrival;
}

const { width, height } = Dimensions.get("window");

console.log("width", width);
console.log("height", height);

const BusArrivalCard: React.FC<BusArrivalCardProps> = ({ arrival, stop }) => {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "곧 도착";
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  const getStatusColor = (time: number) => {
    if (time <= 0) return "text-red-600";
    if (time <= 300) return "text-orange-600"; // 5분 이하
    return "text-green-600";
  };
  // console.log("arrival", arrival);
  const {
    data: stations = [],
    isLoading,
    error,
    refetch,
  } = useGetRouteStationsQuery({ routeId: arrival.routeId });

  // console.log("stop", stop);
  // console.log("stations", stations);
  const getCongestionLabel = (level: number): string => {
    switch (level) {
      case 1:
        return "여유";
      case 2:
        return "보통";
      case 3:
        return "혼잡";
      case 4:
        return "매우혼잡";
      default:
        return "정보 없음";
    }
  };
  const scrollRef = useRef<ScrollView>(null);
  const [targetX, setTargetX] = useState(0);
  const stationRefs = useRef<({ measure: Function } | null)[]>([]);

  useEffect(() => {
    const index = stations.findIndex((s) => s.stationId === stop.stationId);
    const ref = stationRefs.current[index];
    if (ref) {
      ref.measure((fx, fy, width, height, px, py) => {
        setTargetX(px); // ScrollView 기준의 x 좌표

      });
    }
  }, [stations]);

  const scrollToTarget = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: targetX - (2 * width) / 3, animated: true });
      // console.log("targetX", targetX);
    }
  };

  return (
    <View className="bg-warning-100 rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-8 bg-blue-500 rounded items-center justify-center mr-3">
            <Text className="text-white font-bold text-xs">
              {arrival.routeName}
            </Text>
          </View>
          <Text className="text-lg font-semibold text-gray-800">
            {arrival.routeName}번
          </Text>
          <Text className="text-lg font-semibold text-gray-800 ml-6">
            {arrival.routeDestName} 행
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-xs text-gray-800">정류장 순서</Text>
          <Text className="text-sm font-medium text-gray-900">
            {arrival.staOrder}번째
          </Text>
        </View>
      </View>

      <View className="space-y-2">
        <View>
          {/* 첫 번째 버스 */}
          <View className="flex-row items-center justify-between bg-gray-200 p-1">
            <View className="flex-row items-center">
              <Ionicons
                name="bus"
                size={16}
                color={arrival.lowPlate1 === 1 ? "#10B981" : "#6B7280"}
              />
              <Text className="ml-2 text-sm text-gray-700">
                1st 버스 {arrival.lowPlate1 === 1 ? "(저상)" : ""}
              </Text>
              <Text className="ml-2 text-sm text-gray-700" ellipsizeMode="tail">
                {arrival.stationNm1.substring(0, 12)}
              </Text>
            </View>
            <View className="items-end flex-row">
              <Text
                className={`text-sm font-bold ${getStatusColor(
                  arrival.predictTimeSec1
                )}`}
              >
                {formatTime(arrival.predictTimeSec1)}/
                {getCongestionLabel(arrival.crowded1)}
              </Text>
              <Text className="text-sm text-gray-500">
                ({arrival.locationNo1}번째 전)
              </Text>
            </View>
          </View>
          {/* 두 번째 버스 */}
          <View className="flex-row items-center justify-between bg-gray-200 p-1">
            <View className="flex-row items-center">
              <Ionicons
                name="bus"
                size={16}
                color={arrival.lowPlate2 === 1 ? "#10B981" : "#6B7280"}
              />
              <Text className="ml-2 text-sm text-gray-700">
                2st 버스 {arrival.lowPlate2 === 1 ? "(저상)" : ""}
              </Text>
              <Text className="ml-2 text-sm text-gray-700" ellipsizeMode="tail">
                {arrival.stationNm2.substring(0, 12)}
              </Text>
            </View>
            <View className="items-end flex-row">
              <Text
                className={`text-sm font-bold ${getStatusColor(
                  arrival.predictTimeSec2
                )}`}
              >
                {formatTime(arrival.predictTimeSec2)}/
                {getCongestionLabel(arrival.crowded2)}
              </Text>
              <Text className="text-sm text-gray-500">
                ({arrival.locationNo2}번째 전)
              </Text>
            </View>
          </View>
          {/* 버스 그림 */}
          <TouchableOpacity
            onPress={scrollToTarget}
            className="p-2 bg-gray-500 m-2 rounded"
          >
            <Text className="text-white text-center">위치로</Text>
          </TouchableOpacity>
          <ScrollView
            ref={scrollRef}
            horizontal
            className="bg-gray-200 p-4 mt-2 rounded-lg"
            showsHorizontalScrollIndicator={false}
          >
            <View className="flex-row items-center">
              {stations.map((station: StationType, index: number) => {
                const busAtStop =
                  arrival.locationNo1 + index + 1 === arrival.staOrder ||
                  arrival.locationNo2 + index + 1 === arrival.staOrder;
                const currentStop = station.stationId === stop.stationId;
                return (
                  <View key={index + 1}>
                    {busAtStop ? (
                      <View className="flex-row items-center">
                        <View
                          className={`w-8 h-8  justify-center items-center border border-#7c3aed rounded-full ${currentStop ? "bg-green-500" : "bg-warning-200"
                            }`}
                        >
                          <Ionicons name="bus" size={16} color="#7c3aed" />
                        </View>
                        <View className="h-1 bg-gray-500">
                          <Text className="text-gray-900">{index + 1}</Text>
                        </View>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <View
                          className={`justify-center items-center border  rounded-full ${currentStop
                            ? "w-8 h-8 bg-green-500 border-green-900 "
                            : "w-5 h-5 border-gray-500"
                            }`}
                        >
                          {currentStop ? (
                            <View
                              ref={(el) => (stationRefs.current[index] = el)}
                              key={station.stationId}
                            >
                              <MaterialIcons
                                name="my-location"
                                size={16}
                                color="yellow"
                              />
                            </View>
                          ) : (
                            <Text className="text-gray-900">{index + 1}</Text>
                          )}
                        </View>
                        <View className="h-1 bg-gray-500">
                          <Text className="text-gray-200">----</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

interface BusArrivalListProps {
  stop: BusStop;
  arrivals: BusArrival[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const BusArrivalList: React.FC<BusArrivalListProps> = ({
  stop,
  arrivals,
  isLoading,
  onRefresh,
}) => {
  if (arrivals.length === 0 && !isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Ionicons name="bus-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg mt-4">도착 정보가 없습니다</Text>
        <Text className="text-gray-400 text-sm mt-2">
          잠시 후 다시 시도해주세요
        </Text>
      </View>
    );
  }

  // Ensure arrivals is always an array
  const arrivalsArray = Array.isArray(arrivals) ? arrivals : [arrivals];

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="p-4">
        {arrivalsArray.map((arrival, index) => (
          <BusArrivalCard
            key={`${arrival.routeId}-${index}`}
            arrival={arrival}
            stop={stop}
          />
        ))}
      </View>
    </ScrollView>
  );
};
