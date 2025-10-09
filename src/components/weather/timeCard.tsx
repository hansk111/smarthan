import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const TimeCard = () => {
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('ko-KR', {
                timeZone: 'Asia/Seoul',
                weekday: 'long',
                month: 'long',
                day: 'numeric',
            });

            const timeStr = now.toLocaleTimeString('ko-KR', {
                timeZone: 'Asia/Seoul',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            setDate(dateStr);
            setTime(timeStr);
        };

        updateTime(); // 초기값 설정
        const interval = setInterval(updateTime, 1000); // 1초마다 갱신

        return () => clearInterval(interval); // 언마운트 시 정리
    }, []);

    return (
        <View className="w-full max-w-md mb-4">
            {/* 날짜 카드 */}
            <View className="bg-white rounded-xl justify-center items-center shadow-md p-4 mb-2">
                <Text className="text-lg font-semibold text-gray-700 mb-2">📅 오늘 날짜</Text>
                <Text className="text-4xl font-bold text-blue-500 mt-2">{date}</Text>
            </View>

            {/* 시간 카드 */}
            <View className="bg-white rounded-xl shadow-md p-4 items-center">
                <Text className="text-lg font-semibold text-gray-700 mb-2">🕒 현재 시간</Text>
                <Text className="text-4xl font-bold text-blue-500 tracking-widest">{time}</Text>
            </View>
        </View>
    );
};

export default TimeCard;
