import { GoogleMaps } from "expo-maps";
import { GoogleMapsMapType } from "expo-maps/build/google/GoogleMaps.types";
import React, { useRef } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

interface Station {
  adminName: string;
  centerYn: string;
  districtCd: number;
  mobileNo: string;
  regionName: string;
  stationId: number;
  stationName: string;
  stationSeq?: number;
  turnSep: number;
  turnYn: string;
  x: number;
  y: number;
}

interface Location {
  crowded: number;
  lowPlate: number;
  plateNo: string;
  remainSeatCnt: number;
  routeId: string;
  routeTypeCd: number;
  stateCd: number;
  stationId: number;
  stationSeq: number;
  taglessCd: number;
  vehId: number;
}

interface BusMapProps {
  locations: Location[];
  stations: Station[];
}

const SF_ZOOM = 12;

export const BusMap: React.FC<BusMapProps> = ({ locations, stations }) => {
  const averageCoordinates = () => {
    if (stations.length === 0) {
      return { latitude: 37.5665, longitude: 126.978 }; // 기본값 (서울)
    }

    const total = stations.reduce(
      (acc, station) => {
        return {
          latitude: acc.latitude + station.x,
          longitude: acc.longitude + station.y,
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

  // 경로 좌표 생성 (station 순서대로)
  const polylineCoordinates = stations.map((station) => ({
    latitude: station.x,
    longitude: station.y,
  }));

  const markersStations = stations.map((station, index) => ({
    id: `station-${index}`,
    coordinates: {
      latitude: station.x,
      longitude: station.y,
    },
    title: station.stationName,
    snippet: `지역: ${station.regionName}`,
    draggable: true,
    icon: require("@assets/station-icon.jpg"),
  }));

  const markersBus = locations.map((bus, index) => {
    const station = stations.find((s) => s.stationId === bus.stationId);
    if (!station) return null;
    return {
      id: `bus-${index}`,
      coordinates: {
        latitude: station.x,
        longitude: station.y,
      },
      title: station.stationName,
      snippet: `지역: ${station.regionName}`,
      draggable: true,
      icon: require("@assets/bus-icon.jpg"),
    };
  });
  const markersBusFiltered = markersBus.filter((marker) => marker !== null);

  const allMarkers = [...markersStations, ...markersBusFiltered];

  const ref = useRef<GoogleMaps.MapView>(null);

  return (
    <View className="flex-1">
      <Text className="font-bold text-gray-500">정류장 및 경로 정보</Text>
      <GoogleMaps.View
        ref={ref}
        style={StyleSheet.absoluteFill}
        cameraPosition={cameraPosition}
        properties={{
          isBuildingEnabled: true,
          isIndoorEnabled: true,
          mapType: GoogleMapsMapType.TERRAIN, //HYBRID, NORMAL, SATELLITE, TERRAIN
          selectionEnabled: true,
          isMyLocationEnabled: true, // requires location permission
          isTrafficEnabled: true,
          // minZoomPreference: 1,
          // maxZoomPreference: 20,
        }}
        // 3
        polylines={[
          {
            color: "red",
            width: 20,
            coordinates: polylineCoordinates,
          },
        ]}
        // 4
        markers={allMarkers}
        onPolylineClick={(event) => {
          console.log(event);
          Alert.alert("Polyline clicked", JSON.stringify(event));
        }}
        onMapLoaded={() => {
          console.log(JSON.stringify({ type: "onMapLoaded" }, null, 2));
        }}
        onMapClick={(e) => {
          console.log(JSON.stringify({ type: "onMapClick", data: e }, null, 2));
        }}
        onMapLongClick={(e) => {
          console.log(
            JSON.stringify({ type: "onMapLongClick", data: e }, null, 2)
          );
        }}
        onPOIClick={(e) => {
          console.log(JSON.stringify({ type: "onPOIClick", data: e }, null, 2));
        }}
        onMarkerClick={(e) => {
          console.log(
            JSON.stringify({ type: "onMarkerClick", data: e }, null, 2)
          );
        }}
        onCameraMove={(e) => {
          console.log(
            JSON.stringify({ type: "onCameraMove", data: e }, null, 2)
          );
        }}
      />
    </View>
  );
};
