import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { EmptyState } from "@/components/bus";
import { images } from "@/constants/images";
import {
  useGetRouteInfoItemQuery,
  useGetRouteLocationQuery,
  useGetRouteStationsQuery,
} from "@/store/bus/busApi";
import { addFavorite, removeFavorite } from "@/store/bus/busSlice";
import type { RootState } from "@/store/store";
import type { BusRoute, LocationType, StationType } from "@/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { GoogleMaps } from "expo-maps";
import { BusStopRouteCard } from "../BusStopRouteCard";

interface BusRouteDetailScreenProps {
  route: BusRoute;
  onBack: () => void;
  currentLocation: any;
  onStopPress: (stopId: number) => void;
  calculateDistance: any;
}

const SF_ZOOM = 12;

export const BusRouteDetailScreen: React.FC<BusRouteDetailScreenProps> = ({
  route,
  onBack,
  onStopPress,
  currentLocation,
  calculateDistance,
}) => {
  const dispatch = useDispatch();
  const { favorites } = useSelector((state: RootState) => state.bus);
  const isFavorite = favorites.includes(route.routeId);

  const [isMapmode, setIsMapmode] = useState(false);
  const [direction, setDirection] = useState(false);

  // const [fstations, setFstations] = useState<StationType[]>([]);
  // const [rstations, setRstations] = useState<StationType[]>([]);

  const [stations, setStations] = useState<StationType[]>([]);

  // console.log("route", route.routeId);

  const {
    data: allstations = [],
    isLoading,
    error,
    refetch,
  } = useGetRouteStationsQuery({ routeId: route.routeId });
  // console.log("stations", stations);
  const { data: businfo } = useGetRouteInfoItemQuery({
    routeId: route.routeId,
  });

  useEffect(() => {
    if (allstations.length > 0 && allstations[0].turnSeq !== undefined) {
      const turnSeq = allstations[0].turnSeq;

      const forwardStations = allstations.slice(0, turnSeq);
      const reverseStations = allstations.slice(turnSeq - 1);

      // setFstations(forwardStations);
      // setRstations(reverseStations);

      if (!direction) {
        setStations(forwardStations);
      } else {
        setStations(reverseStations);
      }
    }
  }, [allstations, direction]);

  const { data: locations = [], refetch: refetchLocations } =
    useGetRouteLocationQuery(
      { routeId: route.routeId },
      { pollingInterval: 60000 } // 60초마다 자동 갱신
    );

  // console.log("locations", locations);

  const handleRefresh = () => {
    refetchLocations();
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(route.routeId));
      Alert.alert("알림", "즐겨찾기에서 제거되었습니다.");
    } else {
      dispatch(addFavorite(route.routeId));
      Alert.alert("알림", "즐겨찾기에 추가되었습니다.");
    }
  };

  const getRouteTypeColor = (routeTypeName: string) => {
    switch (routeTypeName) {
      case "직행좌석형시내버스":
        return "bg-red-500";
      case "좌석형시내버스":
        return "bg-blue-500";
      case "일반형시내버스":
        return "bg-green-500";
      case "광역급행형시내버스":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const averageCoordinates = () => {
    if (stations.length === 0) {
      return { latitude: 37.5665, longitude: 126.978 }; // 기본값 (서울)
    }

    const total = stations.reduce(
      (acc: any, station: StationType) => {
        return {
          latitude: acc.latitude + station.y,
          longitude: acc.longitude + station.x,
        };
      },
      { latitude: 0, longitude: 0 }
    );

    return {
      latitude: total.latitude / stations.length,
      longitude: total.longitude / stations.length,
    };
  };

  const cameraPosition = {
    coordinates: averageCoordinates(),
    zoom: SF_ZOOM,
  };
  // console.log("cameraPosition", cameraPosition);
  const polylineCoordinates = stations.map((station: StationType) => ({
    latitude: station.y,
    longitude: station.x,
  }));

  const markersStations = stations.map(
    (station: StationType, index: number) => ({
      id: `station-${index}`,
      coordinates: {
        latitude: station.y,
        longitude: station.x,
      },
      title: station.stationName,
      snippet: `지역: ${station.regionName}`,
      draggable: true,
      icon: images.busImage,
    })
  );

  // console.log("images.busImage:", images.busImage);

  const markersBus = locations.map((bus: LocationType, index: number) => {
    const station = stations.find((s: any) => s.stationId === bus.stationId);
    if (!station) return null;
    return {
      id: `bus-${index}`,
      coordinates: {
        latitude: station.y,
        longitude: station.x,
      },
      title: station.stationName,
      snippet: `지역: ${station.regionName}`,
      draggable: true,
      icon: undefined,
    };
  });
  const markersBusFiltered = markersBus.filter(
    (marker: any) => marker !== null
  );

  // const allMarkers = [...markersStations, ...markersBusFiltered];
  const allMarkers = markersBusFiltered;
  const ref = useRef<GoogleMaps.MapView>(null);

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-gray-700 text-lg font-medium mt-4">
            노선 정보를 불러올 수 없습니다
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            네트워크 상태를 확인하고 다시 시도해주세요
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-lg px-6 py-3 mt-4"
            onPress={refetch}
          >
            <Text className="text-white font-medium">다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-gray-200 px-2 py-2 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={onBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-gray-800 flex-1 text-center mr-10">
            노선 정보
          </Text>
        </View>

        {/* 노선 정보 */}
        <View className="bg-gray-100 rounded-lg p-2">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View
                className={`px-3 py-1 rounded-lg ${getRouteTypeColor(
                  businfo?.routeTypeName
                )}`}
              >
                <Text className="text-white text-sm font-bold">
                  {businfo?.routeTypeName}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-2xl font-bold text-gray-800">
                  {businfo?.routeName}
                </Text>
                <Text className="text-sm text-gray-600">
                  {businfo?.companyName}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleToggleFavorite} className="p-2">
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#EF4444" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          {/* 운행 시간 정보 */}
          <View className="bg-white rounded-lg p-2">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              운행 정보
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">
                평일 기점({businfo?.startStationName}) 첫차/막차
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                {businfo?.upFirstTime} / {businfo?.upLastTime}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">
                평일 종점({businfo?.endStationName}) 첫차/막차
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                {businfo?.downFirstTime} / {businfo?.downLastTime}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 정류장 목록 보는 방법 */}
      <View className="flex-1">
        <View className="flex-row px-4 py-3 justify-between bg-white border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-800">
            경유({stations.length}개)
          </Text>
          <View className="flex-row ">
            {/* 방향  */}
            <TouchableOpacity
              className="bg-primary-500 rounded-lg p-2 mr-2 flex-row items-center justify-center"
              onPress={() => {
                setDirection(!direction);
              }}
              disabled={isLoading}
            >
              {direction ? (
                <MaterialCommunityIcons
                  name="format-textdirection-l-to-r"
                  size={18}
                  color="white"
                  style={{ marginRight: 12 }}
                />
              ) : (
                <MaterialCommunityIcons
                  name="format-textdirection-r-to-l"
                  size={18}
                  color="white"
                  style={{ marginRight: 12 }}
                />
              )}
              <Text className="text-white font-medium">
                {direction ? "상행" : "하행"}
              </Text>
            </TouchableOpacity>
            {/* 지도로 보기  */}
            <TouchableOpacity
              className="bg-primary-500 rounded-lg p-2 mr-2 flex-row items-center justify-center"
              onPress={() => {
                setIsMapmode(!isMapmode);
              }}
              disabled={isLoading}
            >
              {isMapmode ? (
                <Ionicons
                  name="list"
                  size={14}
                  color="white"
                  style={{ marginRight: 12 }}
                />
              ) : (
                <Ionicons
                  name="map"
                  size={14}
                  color="white"
                  style={{ marginRight: 12 }}
                />
              )}
              <Text className="text-white font-medium">
                {isMapmode ? "리스트" : "지도"}
              </Text>
            </TouchableOpacity>
            {/* 정보 갱신 */}
            <TouchableOpacity
              className="bg-primary-500 rounded-lg p-2 flex-row items-center justify-center"
              onPress={handleRefresh}
              disabled={isLoading}
            >
              <Ionicons
                name="refresh"
                size={14}
                color="white"
                style={{ marginRight: 12 }}
              />
              <Text className="text-white font-medium">
                {isLoading ? "갱신 중..." : "갱신"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* 새로고침 버튼 */}

        {isMapmode && Platform.OS === "android" ? (
          <Text>under constr</Text>
        ) : // <BusMap locations={locations} stations={stations}></BusMap>
        // <GoogleMaps.View
        //   ref={ref}
        //   style={{ flex: 1 }}
        //   cameraPosition={cameraPosition}
        //   properties={{
        //     isBuildingEnabled: true,
        //     isIndoorEnabled: true,
        //     mapType: GoogleMapsMapType.TERRAIN, //HYBRID, NORMAL, SATELLITE, TERRAIN
        //     selectionEnabled: true,
        //     isMyLocationEnabled: true, // requires location permission
        //     isTrafficEnabled: true,
        //     // minZoomPreference: 1,
        //     // maxZoomPreference: 20,
        //   }}
        //   // 3
        //   polylines={[
        //     {
        //       color: "blue",
        //       width: 5,
        //       coordinates: polylineCoordinates,
        //     },
        //   ]}
        //   // 4
        //   markers={allMarkers}
        //   // onPolylineClick={(event) => {
        //   //   console.log(event);
        //   //   Alert.alert("Polyline clicked", JSON.stringify(event));
        //   // }}
        //   // onMapLoaded={() => {
        //   //   console.log(JSON.stringify({ type: "onMapLoaded" }, null, 2));
        //   // }}
        //   // onMapClick={(e) => {
        //   //   console.log(
        //   //     JSON.stringify({ type: "onMapClick", data: e }, null, 2)
        //   //   );
        //   // }}
        //   // onMapLongClick={(e) => {
        //   //   console.log(
        //   //     JSON.stringify({ type: "onMapLongClick", data: e }, null, 2)
        //   //   );
        //   // }}
        //   // onPOIClick={(e) => {
        //   //   console.log(
        //   //     JSON.stringify({ type: "onPOIClick", data: e }, null, 2)
        //   //   );
        //   // }}
        //   // onMarkerClick={(e) => {
        //   //   console.log(
        //   //     JSON.stringify({ type: "onMarkerClick", data: e }, null, 2)
        //   //   );
        //   // }}
        //   // onCameraMove={(e) => {
        //   //   console.log(
        //   //     JSON.stringify({ type: "onCameraMove", data: e }, null, 2)
        //   //   );
        //   // }}
        // />
        stations.length > 0 ? (
          <ScrollView
            className="flex-1 px-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="py-2 space-y-4">
              {stations.map((item: StationType, index: number) => {
                if ("stationName" in item) {
                  // 버스 정류장
                  const stop = item as any;
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
                      <BusStopRouteCard
                        // key={stop.stationId}
                        locations={locations}
                        stop={stop}
                        onPress={() => onStopPress(item.stationId)}
                        distance={distance}
                        showDistance={!!distance}
                      />
                    </View>
                  );
                }
              })}
            </View>
          </ScrollView>
        ) : (
          <EmptyState
            title="정류장 정보가 없습니다"
            subtitle="잠시 후 다시 시도해주세요"
          />
        )}
      </View>
    </View>
  );
};
