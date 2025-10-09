import type { BusStop } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface BusStopCardProps {
  // key: string;
  stop: BusStop;
  onPress: () => void;
  distance?: number; // 거리 (미터)
  showDistance?: boolean;
}

export const BusStopCard: React.FC<BusStopCardProps> = ({
  // key,
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

  return (
    // <Link href={{
    //   pathname: '/bus/[id]',
    //   params: { id: `${stop.stationId}` }
    // }} asChild>
    <TouchableOpacity
      className="bg-success-100 rounded-lg p-4 mb-3 shadow-sm border border-success-300"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="bus" size={20} color="#3B82F6" />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">{stop.stationName}</Text>
            <Text className="text-sm text-gray-600">{stop.regionName}</Text>
            {stop.mobileNo && (
              <Text className="text-xs text-gray-500 mt-1">정류장 번호: {stop.mobileNo}</Text>
            )}
          </View>
        </View>

        <View className="items-end">
          {showDistance && distance !== undefined && (
            <View className="bg-green-100 px-2 py-1 rounded-full mb-1">
              <Text className="text-sm text-green-700 font-medium">
                {formatDistance(distance)}
              </Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
    // </Link>
  );
};