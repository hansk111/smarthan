import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
    items: string[];
    iconName?: keyof typeof Feather.glyphMap;
};

export default function BadgeList({ items, iconName }: Props) {
    return (
        <View className="flex-wrap flex-row gap-2 bg-primary-200 py-2 px-2 rounded">
            {items.map((txt, i) => (
                <View
                    key={i}
                    className="flex-row items-center bg-gray-200 rounded-full px-3 py-1"
                >
                    {iconName && (
                        <Feather name={iconName} size={12} color="#1d4ed8" className="mr-1" />
                    )}
                    <Text className="text-md text-gray-800">{txt}</Text>
                </View>
            ))}
        </View>
    );
}