import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ListRenderItemInfo,
  Pressable,
  Text,
  View,
} from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣  DATA – declare every icon you want to display.
//     Keep the PNG files in `assets/icons/` (or use any remote URL).
// ─────────────────────────────────────────────────────────────────────────────
type AppIcon = {
  id: string;
  name: string;
  // You can also use `require('../assets/icons/…')` for static assets.
  source: ImageSourcePropType;
  disabled?: boolean;
};

const ICONS: AppIcon[] = [
  {
    id: "1",
    name: "MBTI",
    source: require("@assets/icons/mbti.png"),
    disabled: false,
  },
  {
    id: "2",
    name: "Chat",
    source: require("@assets/icons/chat.png"),
    disabled: true,
  },
  {
    id: "3",
    name: "Music",
    source: require("@assets/icons/music.png"),
    disabled: true,
  },
  {
    id: "4",
    name: "Calendar",
    source: require("@assets/icons/calendar.png"),
    disabled: true,
  },
  {
    id: "5",
    name: "Maps",
    source: require("@assets/icons/maps.png"),
    disabled: true,
  },
  {
    id: "6",
    name: "Settings",
    source: require("@assets/icons/settings.png"),
    disabled: true,
  },
  // ← add more icons as you wish
];

// ─────────────────────────────────────────────────────────────────────────────
// 2️⃣  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Applications() {
  const router = useRouter();

  // When an icon is pressed you can navigate anywhere you want.
  const onPressIcon = (icon: AppIcon) => {
    // Example: navigate to a generic "Detail" screen and pass the icon name
    // navigation.navigate('Detail', { iconName: icon.name });
    router.push(`/${icon.name}` as any);
  };

  // -------------------------------------------------------------------------
  // 3️⃣  Render Item (FlatList)
  // -------------------------------------------------------------------------
  const renderItem = ({ item }: ListRenderItemInfo<AppIcon>) => (
    <Pressable
      onPress={() => onPressIcon(item)}
      className={`flex-1 m-2 items-center ${item.disabled ? "opacity-30" : ""}`}
      disabled={item.disabled}
      android_ripple={{ color: "#e0e0e0" }}
    >
      {/* Icon image – keep it square for a perfect grid */}
      <View className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
        <View className="w-10 h-10">
          {/* `Image` works with static `require` sources out‑of‑the‑box */}
          <Image
            source={item.source}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Label */}
      <Text className="mt-2 text-sm text-gray-800">{item.name}</Text>
    </Pressable>
  );

  // -------------------------------------------------------------------------
  // 4️⃣  Layout – a 2‑column responsive grid
  // -------------------------------------------------------------------------
  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Optional header */}
      <View className="mb-4 items-center justify-between">
        <Text className="text-xl font-semibold text-gray-900">
          앱 아이콘 모음
        </Text>
      </View>

      {/* The grid */}
      <FlatList
        data={ICONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2} // ← 2 columns, change to 3 for tighter layout
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}
