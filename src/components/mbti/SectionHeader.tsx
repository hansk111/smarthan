import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
    title: string;
    iconName?: keyof typeof Feather.glyphMap;
};

export default function SectionHeader({ title, iconName }: Props) {
    return (
        <View className="flex-row items-center mb-2">
            {iconName && (
                <Feather name={iconName} size={20} color="#4F46E5" className="mr-2" />
            )}
            <Text className="text-lg font-semibold text-primary">{title}</Text>
        </View>
    );
}