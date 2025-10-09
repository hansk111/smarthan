import type { BusStop } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Text, View } from 'react-native';


interface RouteLocation {
    crowded: number;
    lowPlate: number;
    plateNo: string;
    remainSeatCnt: number;
    routeId: string;
    routeTypeCd: number;
    stateCd: number;
    stationId: string;
    stationSeq: number;
    taglessCd: number;
    vehId: string;
}
interface BusStopRouteCardProps {
    // key: string;
    stop: BusStop;
    locations: RouteLocation[];
    onPress: () => void;
    distance?: number; // 거리 (미터)
    showDistance?: boolean;
}



export const BusStopRouteCard: React.FC<BusStopRouteCardProps> = ({
    // key,
    locations,
    stop,
    onPress,
    distance,
    showDistance = false,
}) => {
    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    };

    const matchedLocation = locations.find(p => p.stationSeq === stop.stationSeq);

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

    const getCongestionColor = (level: number): string => {
        switch (level) {
            case 1:
                return "#4ade80";
            case 2:
                return "#fee2e2";
            case 3:
                return "#fca5a5";
            case 4:
                return "#dc2626";
            default:
                return "#9ca3af";
        }
    };

    return (
        <View
            // className="flex-row items-center justify-between bg-success-100 rounded-lg p-4 mb-3 shadow-sm border border-success-300"
            className={`flex-row items-center justify-between rounded-lg p-1 mb-1 shadow-sm border ${matchedLocation ? "bg-warning-100 border-warning-300" : "bg-gray-300 border-gray-300"}`}
        >
            <View className="flex-row items-center flex-1">
                <Text className="text-lg font-semibold text-gray-800">{stop.stationSeq}</Text>
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="bus" size={20} color="#3B82F6" />
                </View>

                <View className="flex-1">
                    <Text className={`text-lg font-semibold text-gray-800 ${matchedLocation ? "text-primary-500" : " text-gray-500"}`}>{stop.stationName}</Text>
                    {/* <Text className="text-sm text-gray-600">{stop.regionName}</Text>
                    {stop.mobileNo && (
                        <Text className="text-xs text-gray-500 mt-1">정류장 번호: {stop.mobileNo}</Text>
                    )} */}
                </View>
            </View>
            <Text className="text-sm text-green-700 font-medium mr-2">
                {matchedLocation ? getCongestionLabel(matchedLocation.crowded) : ""}
            </Text>
            <Text className="text-sm text-green-700 font-medium mr-2">
                {matchedLocation ? (<MaterialIcons name="bus-alert" size={24} color={getCongestionColor(matchedLocation.crowded)} />) : ""}
            </Text>
            <View className="items-end">
                {showDistance && distance !== undefined && (
                    <View className="bg-green-100 px-2 py-1 rounded-full mb-1">
                        <Text className="text-sm text-green-700 font-medium">
                            📍 {formatDistance(distance)}
                        </Text>
                    </View>
                )}
                {/* <Ionicons name="chevron-forward" size={16} color="#9CA3AF" /> */}
            </View>
        </View>
    );
};