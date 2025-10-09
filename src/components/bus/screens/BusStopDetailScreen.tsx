import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { BusArrivalList, Loading } from '@/components/bus/';
import { useGetBusArrivalInfoQuery } from '@/store/bus/busApi';
import { useSaveBusStationMutation } from '@/store/bus/BusApiSlice';
import { addFavorite, removeFavorite } from '@/store/bus/busSlice';
import type { RootState } from '@/store/store';
import type { BusStop } from '@/types';

interface BusStopDetailScreenProps {
    stop: BusStop;
    onBack: () => void;
}

export const BusStopDetailScreen: React.FC<BusStopDetailScreenProps> = ({
    stop,
    onBack,
}) => {
    const dispatch = useDispatch();
    const { favorites } = useSelector((state: RootState) => state.bus);
    const isFavorite = favorites.includes(stop.stationId);
    const [saveStation] = useSaveBusStationMutation();
    const {
        data: arrivals = [],
        isLoading,
        error,
        refetch,
    } = useGetBusArrivalInfoQuery(
        { id: stop.stationId },
        { pollingInterval: 60000 } // 30초마다 자동 갱신
    );
    // console.log("id", stop.stationId)
    // console.log("name", stop.stationName)
    console.log("arrivals", arrivals);




    const handleToggleFavorite = () => {
        const formData = new FormData();
        formData.append('stationId', stop.stationId);
        formData.append('stationName', stop.stationName);
        formData.append('regionName', stop.regionName);
        formData.append('mobileNo', stop.mobileNo);
        formData.append('centerYn', stop.centerYn);
        formData.append('x', stop.x);
        formData.append('y', stop.y);
        saveStation(formData)
            .unwrap()
            .then(() => {
                console.log("favoriaty created");
            })
            .catch(() => {
                console.log("Failed to create favoriaty");
            });

        if (isFavorite) {
            dispatch(removeFavorite(stop.stationId));
            Alert.alert('알림', '즐겨찾기에서 제거되었습니다.');
        } else {
            dispatch(addFavorite(stop.stationId));
            Alert.alert('알림', '즐겨찾기에 추가되었습니다.');
        }
    };

    const handleRefresh = () => {
        refetch();
    };

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center p-8">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="text-gray-700 text-lg font-medium mt-4">
                        정보를 불러올 수 없습니다
                    </Text>
                    <Text className="text-gray-500 text-sm mt-2 text-center">
                        네트워크 상태를 확인하고 다시 시도해주세요
                    </Text>
                    <TouchableOpacity
                        className="bg-primary rounded-lg px-6 py-3 mt-4"
                        onPress={handleRefresh}
                    >
                        <Text className="text-white font-medium">다시 시도</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-200">
            {/* 헤더 */}
            <View className="bg-white px-4 py-3 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={onBack} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>

                    <Text className="text-xl font-bold text-gray-800 flex-1 text-center mr-10">
                        정류장 정보
                    </Text>
                </View>

                {/* 정류장 정보 */}
                <View className="bg-gray-300 rounded-lg p-4 mb-4">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-800 mb-2">
                                {stop.stationName}
                            </Text>
                            <Text className="text-sm text-gray-600 mb-1">
                                {stop.regionName}
                            </Text>
                            {stop.mobileNo && (
                                <Text className="text-sm text-gray-500">
                                    정류장 번호: {stop.mobileNo}
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleToggleFavorite}
                            className="p-2"
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? '#EF4444' : '#9CA3AF'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 새로고침 버튼 */}
                <TouchableOpacity
                    className="bg-primary-500 rounded-lg p-3 flex-row items-center justify-center"
                    onPress={handleRefresh}
                    disabled={isLoading}
                >
                    <Ionicons
                        name="refresh"
                        size={16}
                        color="white"
                        style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-medium text-lg">
                        {isLoading ? '갱신 중...' : '도착 정보 갱신'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 버스 도착 정보 */}
            <View className="flex-1">
                {isLoading && arrivals.length === 0 ? (
                    <Loading message="도착 정보를 불러오는 중..." />
                ) : (
                    <BusArrivalList
                        stop={stop}
                        arrivals={arrivals}
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};