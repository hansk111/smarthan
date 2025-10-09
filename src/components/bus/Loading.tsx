import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = '로딩 중...', 
  size = 'large' 
}) => {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size={size} color="#3B82F6" />
      <Text className="text-gray-600 text-base mt-4">{message}</Text>
    </View>
  );
};

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search-outline',
  title,
  subtitle,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Text className="text-4xl">🚌</Text>
      </View>
      <Text className="text-gray-700 text-lg font-medium mb-2">{title}</Text>
      {subtitle && (
        <Text className="text-gray-500 text-sm text-center">{subtitle}</Text>
      )}
    </View>
  );
};
