import type { BusRoute } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';


interface BusRouteCardProps {
  route: BusRoute;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const BusRouteCard: React.FC<BusRouteCardProps> = ({
  route,
  onPress,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const getRouteTypeColor = (routeTypeName: string) => {
    switch (routeTypeName) {
      case '직행좌석':
        return 'bg-red-500';
      case '좌석':
        return 'bg-blue-500';
      case '일반':
        return 'bg-green-500';
      case '광역급행':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`px-2 py-1 rounded ${getRouteTypeColor(route.routeTypeName)}`}>
            <Text className="text-white text-xs font-bold">{route.routeTypeName}</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold text-gray-800">{route.routeName}</Text>
            <Text className="text-sm text-gray-600">{route.company}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="mr-3">
            <Text className="text-xs text-gray-500">첫차-막차</Text>
            <Text className="text-xs text-gray-700">
              {route.upFirstTime} - {route.upLastTime}
            </Text>
          </View>

          {onToggleFavorite && (
            <TouchableOpacity onPress={onToggleFavorite} className="p-2">
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#9CA3AF'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
